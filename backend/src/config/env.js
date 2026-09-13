import 'dotenv/config';
import { z } from 'zod';

const optional = (schema) => z.preprocess((value) => value === '' ? undefined : value, schema.optional());
const frontendOrigins = z.string().min(1).refine(
  (value) => value.split(',').every((origin) => z.string().url().safeParse(origin.trim()).success),
  'FRONTEND_ORIGIN must be one or more comma-separated URLs.',
);

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().optional(),
  FRONTEND_ORIGIN: frontendOrigins.default('http://localhost:5174'),
  ADMIN_EMAILS: z.string().default(''),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-only-jwt-access-secret-change-before-production'),
  PAYMOB_SECRET_KEY: optional(z.string()),
  PAYMOB_PUBLIC_KEY: optional(z.string()),
  PAYMOB_CARD_INTEGRATION_ID: optional(z.coerce.number().int().positive()),
  PAYMOB_HMAC_SECRET: optional(z.string()),
  PAYMOB_WEBHOOK_URL: optional(z.string().url()),
  PAYMOB_REDIRECT_URL: optional(z.string().url()),
});

const parsedEnvironment = environmentSchema.superRefine((value, context) => {
  if (value.NODE_ENV === 'production' && !value.DATABASE_URL) {
    context.addIssue({ code: 'custom', path: ['DATABASE_URL'], message: 'DATABASE_URL is required in production.' });
  }
  if (value.NODE_ENV === 'production' && !value.ADMIN_EMAILS.trim()) {
    context.addIssue({ code: 'custom', path: ['ADMIN_EMAILS'], message: 'ADMIN_EMAILS is required in production.' });
  }
  if (value.NODE_ENV === 'production' && !process.env.JWT_ACCESS_SECRET) {
    context.addIssue({ code: 'custom', path: ['JWT_ACCESS_SECRET'], message: 'JWT_ACCESS_SECRET is required in production.' });
  }
}).safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error('Invalid environment configuration:', parsedEnvironment.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnvironment.data;
export const paymobEnabled = Boolean(env.PAYMOB_SECRET_KEY && env.PAYMOB_PUBLIC_KEY && env.PAYMOB_CARD_INTEGRATION_ID && env.PAYMOB_HMAC_SECRET && env.PAYMOB_WEBHOOK_URL && env.PAYMOB_REDIRECT_URL);
