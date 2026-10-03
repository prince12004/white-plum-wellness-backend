export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongodbUri: process.env.MONGODB_URI as string,
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET as string,
    accessTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET as string,
    refreshTtl: process.env.REFRESH_TOKEN_TTL ?? '7d',
  },
  // Fully separate secrets/TTLs from the admin JWTs above — customer and admin
  // sessions must never be verifiable with each other's keys.
  customerJwt: {
    accessSecret: process.env.CUSTOMER_ACCESS_TOKEN_SECRET as string,
    accessTtl: process.env.CUSTOMER_ACCESS_TOKEN_TTL ?? '30m',
    refreshSecret: process.env.CUSTOMER_REFRESH_TOKEN_SECRET as string,
    refreshTtl: process.env.CUSTOMER_REFRESH_TOKEN_TTL ?? '30d',
  },
  cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost',
  corsOrigins: [process.env.WEB_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean) as string[],
  sms: {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ?? '',
    msg91AuthKey: process.env.MSG91_AUTH_KEY ?? '',
    msg91TemplateId: process.env.MSG91_TEMPLATE_ID ?? '',
  },
  otp: {
    ttlMinutes: parseInt(process.env.OTP_TTL_MINUTES ?? '5', 10),
    resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? '30', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME ?? 'Super Admin',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  },
});
