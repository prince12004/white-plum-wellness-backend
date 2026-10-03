import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP_PROVIDER } from './otp-provider.interface';
import { LocalOtpProvider } from './providers/local-otp.provider';
import { Msg91OtpProvider } from './providers/msg91-otp.provider';
import { TwilioVerifyProvider } from './providers/twilio-verify.provider';
import { OtpChallenge, OtpChallengeSchema } from './schemas/otp-challenge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OtpChallenge.name, schema: OtpChallengeSchema }]),
    ConfigModule,
  ],
  providers: [
    LocalOtpProvider,
    TwilioVerifyProvider,
    Msg91OtpProvider,
    {
      provide: OTP_PROVIDER,
      inject: [ConfigService, LocalOtpProvider, TwilioVerifyProvider, Msg91OtpProvider],
      useFactory: (
        config: ConfigService,
        local: LocalOtpProvider,
        twilio: TwilioVerifyProvider,
        msg91: Msg91OtpProvider,
      ) => {
        const hasTwilio = Boolean(config.get<string>('sms.twilioAccountSid') && config.get<string>('sms.twilioVerifyServiceSid'));
        const hasMsg91 = Boolean(config.get<string>('sms.msg91AuthKey') && config.get<string>('sms.msg91TemplateId'));
        if (hasTwilio) return twilio;
        if (hasMsg91) return msg91;
        return local;
      },
    },
  ],
  exports: [OTP_PROVIDER],
})
export class OtpModule {}
