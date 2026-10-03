/**
 * Uniform contract regardless of which backing provider is active. Twilio Verify
 * and MSG91's OTP API both manage code generation/expiry/verification on their own
 * side (we never see or store the code), so `verifyOtp` is a pass-through network
 * call for those; only the local dev fallback actually stores anything.
 */
export interface OtpProvider {
  requestOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

export const OTP_PROVIDER = Symbol('OTP_PROVIDER');
