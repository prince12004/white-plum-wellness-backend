import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OtpProvider } from '../otp-provider.interface';

/**
 * Twilio Verify manages code generation, expiry, and verification entirely on
 * their side — we only ever call their two REST endpoints, never see the code.
 * https://www.twilio.com/docs/verify/api
 */
@Injectable()
export class TwilioVerifyProvider implements OtpProvider {
  constructor(private readonly configService: ConfigService) {}

  private get credentials() {
    const accountSid = this.configService.get<string>('sms.twilioAccountSid') as string;
    const authToken = this.configService.get<string>('sms.twilioAuthToken') as string;
    const serviceSid = this.configService.get<string>('sms.twilioVerifyServiceSid') as string;
    return { accountSid, authToken, serviceSid };
  }

  private authHeader(authToken: string, accountSid: string) {
    return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
  }

  async requestOtp(phone: string): Promise<void> {
    const { accountSid, authToken, serviceSid } = this.credentials;
    const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(authToken, accountSid),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, Channel: 'sms' }),
    });
    if (!res.ok) {
      throw new InternalServerErrorException('Failed to send verification code, please try again');
    }
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const { accountSid, authToken, serviceSid } = this.credentials;
    const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(authToken, accountSid),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, Code: code }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === 'approved';
  }
}
