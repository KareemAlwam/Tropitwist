import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().optional(),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5174'),
  ADMIN_API_KEY: z.string().min(16).optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
});

const parsedEnvironment = environmentSchema.superRefine((value, context) => {
  if (value.NODE_ENV === 'production' && !value.DATABASE_URL) {
    context.addIssue({ code: 'custom', path: ['DATABASE_URL'], message: 'DATABASE_URL is required in production.' });
  }
  if (value.NODE_ENV === 'production' && !value.ADMIN_API_KEY) {
    context.addIssue({ code: 'custom', path: ['ADMIN_API_KEY'], message: 'ADMIN_API_KEY is required in production.' });
  }
}).safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error('Invalid environment configuration:', parsedEnvironment.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnvironment.data;
