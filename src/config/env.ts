import 'dotenv/config'; // ← これで import 時点で .env がロードされる
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string(),
  TOKEN_EXPIRY: z.string().default('1h'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export const env = envSchema.parse(process.env);
