import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashValue, verifyHash } from '../../../common/utils/hash.util';
import { generateOtpCode } from '../../../common/utils/phone.util';
import type { OtpProvider } from '../otp-provider.interface';
import { OtpChallenge, OtpChallengeDocument } from '../schemas/otp-challenge.schema';

/**
 * Dev-mode fallback used when no real SMS provider is configured — generates and
 * hashes its own code and "sends" it by logging to the server console, so the full
 * login flow can be exercised before an MSG91/Twilio account exists.
 */
@Injectable()
export class LocalOtpProvider implements OtpProvider {
  private readonly logger = new Logger(LocalOtpProvider.name);

  constructor(
    @InjectModel(OtpChallenge.name) private readonly challengeModel: Model<OtpChallengeDocument>,
    private readonly configService: ConfigService,
  ) {}

  async requestOtp(phone: string): Promise<void> {
    const existing = await this.challengeModel.findOne({ phone }).sort({ createdAt: -1 });
    const cooldownSeconds = this.configService.get<number>('otp.resendCooldownSeconds') ?? 30;
    if (existing && existing.resendAt.getTime() > Date.now()) {
      const waitSeconds = Math.ceil((existing.resendAt.getTime() - Date.now()) / 1000);
      throw new BadRequestException(`Please wait ${waitSeconds}s before requesting another code`);
    }

    const code = generateOtpCode();
    const ttlMinutes = this.configService.get<number>('otp.ttlMinutes') ?? 5;
    const otpHash = await hashValue(code);

    await this.challengeModel.create({
      phone,
      otpHash,
      expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
      attempts: 0,
      resendAt: new Date(Date.now() + cooldownSeconds * 1000),
    });

    // Dev-mode "send" — replace with a real provider by setting Twilio/MSG91 env vars.
    this.logger.warn(`[DEV OTP] ${phone} → ${code} (expires in ${ttlMinutes}m)`);
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const challenge = await this.challengeModel
      .findOne({ phone })
      .sort({ createdAt: -1 })
      .select('+otpHash');
    if (!challenge) return false;

    const maxAttempts = this.configService.get<number>('otp.maxAttempts') ?? 5;
    if (challenge.attempts >= maxAttempts) return false;
    if (challenge.expiresAt.getTime() < Date.now()) return false;

    const matches = await verifyHash(challenge.otpHash, code);
    if (!matches) {
      challenge.attempts += 1;
      await challenge.save();
      return false;
    }

    await this.challengeModel.deleteMany({ phone });
    return true;
  }
}
