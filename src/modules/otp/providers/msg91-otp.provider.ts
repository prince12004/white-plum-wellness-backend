import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OtpProvider } from '../otp-provider.interface';

/**
 * MSG91's OTP API also generates/verifies the code on their side — we only send
 * the mobile number, never the code. Numbers are passed without the leading `+`
 * per their API convention. https://docs.msg91.com/reference/send-otp
 */
@Injectable()
export class Msg91OtpProvider implements OtpProvider {
  constructor(private readonly configService: ConfigService) {}

  private get credentials() {
    const authKey = this.configService.get<string>('sms.msg91AuthKey') as string;
    const templateId = this.configService.get<string>('sms.msg91TemplateId') as string;
    return { authKey, templateId };
  }

  private stripPlus(phone: string) {
    return phone.replace(/^\+/, '');
  }

  async requestOtp(phone: string): Promise<void> {
    const { authKey, templateId } = this.credentials;
    const url = new URL('https://control.msg91.com/api/v5/otp');
    url.searchParams.set('template_id', templateId);
    url.searchParams.set('mobile', this.stripPlus(phone));

    const res = await fetch(url, {
      method: 'POST',
      headers: { authkey: authKey, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new InternalServerErrorException('Failed to send verification code, please try again');
    }
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const { authKey } = this.credentials;
    const url = new URL('https://control.msg91.com/api/v5/otp/verify');
    url.searchParams.set('mobile', this.stripPlus(phone));
    url.searchParams.set('otp', code);

    const res = await fetch(url, { headers: { authkey: authKey } });
    if (!res.ok) return false;
    const data = (await res.json()) as { type?: string };
    return data.type === 'success';
  }
}
