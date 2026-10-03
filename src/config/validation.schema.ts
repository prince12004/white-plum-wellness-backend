import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  MONGODB_URI: Joi.string().required(),
  ACCESS_TOKEN_SECRET: Joi.string().min(16).required(),
  ACCESS_TOKEN_TTL: Joi.string().default('15m'),
  REFRESH_TOKEN_SECRET: Joi.string().min(16).required(),
  REFRESH_TOKEN_TTL: Joi.string().default('7d'),
  CUSTOMER_ACCESS_TOKEN_SECRET: Joi.string().min(16).required(),
  CUSTOMER_ACCESS_TOKEN_TTL: Joi.string().default('30m'),
  CUSTOMER_REFRESH_TOKEN_SECRET: Joi.string().min(16).required(),
  CUSTOMER_REFRESH_TOKEN_TTL: Joi.string().default('30d'),
  COOKIE_DOMAIN: Joi.string().default('localhost'),
  WEB_ORIGIN: Joi.string().uri().required(),
  ADMIN_ORIGIN: Joi.string().uri().required(),
  // SMS/OTP provider — all optional. With none set, customer-auth falls back to a
  // dev-mode local OTP that's logged to the server console instead of sent.
  TWILIO_ACCOUNT_SID: Joi.string().allow('').optional(),
  TWILIO_AUTH_TOKEN: Joi.string().allow('').optional(),
  TWILIO_VERIFY_SERVICE_SID: Joi.string().allow('').optional(),
  MSG91_AUTH_KEY: Joi.string().allow('').optional(),
  MSG91_TEMPLATE_ID: Joi.string().allow('').optional(),
  OTP_TTL_MINUTES: Joi.number().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: Joi.number().default(30),
  OTP_MAX_ATTEMPTS: Joi.number().default(5),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  SEED_ADMIN_NAME: Joi.string().optional(),
  SEED_ADMIN_EMAIL: Joi.string().email().optional(),
  SEED_ADMIN_PASSWORD: Joi.string().min(8).optional(),
});
