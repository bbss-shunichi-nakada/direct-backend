import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  // 本番はカンマ区切りで複数指定可: https://app.example.com,https://admin.example.com
  CORS_ORIGIN: z.string().optional(),

  // ある場合はレート制限ストア等で使用
  REDIS_URL: z.string().optional(),

  // JWT は必須（未設定なら起動時に落ちる）
  JWT_SECRET: z.string(),
  // 例: "15m" | "7d" | 3600
  JWT_EXPIRES_IN: z.union([z.coerce.number().int().positive(), z.string()]).default('7d'),

  // DB
  DATABASE_URL: z.string(),
});

export const env = schema.parse(process.env);

// 補助：CORSの許可オリジン配列
export const corsOrigins = (env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
