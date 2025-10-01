import cors from 'cors';
import { corsOrigins } from '../config/env';

const allowlist = corsOrigins?.length ? corsOrigins : [];

/**
 * ポリシー:
 * - allowlist が指定されていればその配列のみ許可
 * - 未指定なら `origin: true`（= 要求元をそのまま反映）で開発・本番ともに動作
 *   ※ credentials: true と併用可（ワイルドカードは使わない）
 */
const corsConfigured = cors({
  origin: allowlist.length ? allowlist : true, // ← ここを固定
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token', // ← 追加（大文字）
    'x-csrf-token', // ← 念のため小文字も
    'Idempotency-Key',
  ],
  exposedHeaders: [
    'X-Request-Id',
    'RateLimit-Policy',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
  ],
  maxAge: 86400, // 24h プリフライトキャッシュ
});

export default corsConfigured;
