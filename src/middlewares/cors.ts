import cors from 'cors';
import { env, corsOrigins } from '../config/env';

const isProd = env.NODE_ENV === 'production';
const origin = isProd ? (corsOrigins.length ? corsOrigins : false) : true;
// 本番: CORS_ORIGIN に列挙したドメインだけ許可（カンマ区切り）
// 開発: true（全許可）

const corsConfigured = cors({
  origin,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  maxAge: 600, // preflight を10分キャッシュ
});

export default corsConfigured;
