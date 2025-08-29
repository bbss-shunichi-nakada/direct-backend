import type { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import crypto from 'crypto';
import { env } from '../config/env';

// メモリ（フォールバック）
const memStore = new Map<string, { body: any; status: number; expiresAt: number }>();
const TTL_MS = 10 * 60 * 1000; // 10分

// Redis（任意）
let redis: ReturnType<typeof createClient> | null = null;
if (env.REDIS_URL) {
  redis = createClient({ url: env.REDIS_URL });
  redis.connect().catch(() => {
    redis = null;
  });
}

function keyFor(req: Request) {
  const idk = req.header('Idempotency-Key');
  if (!idk) return null;
  // パス＋メソッドも含めて衝突回避
  return `idem:${req.method}:${req.originalUrl}:${crypto
    .createHash('sha1')
    .update(idk)
    .digest('hex')}`;
}

export const idempotency = async (req: Request, res: Response, next: NextFunction) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const k = keyFor(req);
  if (!k) return next();

  // 既存応答があれば返す
  if (redis) {
    const val = await redis.get(k);
    if (val) {
      const parsed = JSON.parse(val);
      return res.status(parsed.status).json(parsed.body);
    }
  } else {
    const it = memStore.get(k);
    if (it && it.expiresAt > Date.now()) {
      return res.status(it.status).json(it.body);
    }
  }

  // フックして保存
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const status = res.statusCode || 200;
    const payload = JSON.stringify({ status, body });
    if (redis) {
      // expire は秒
      redis!.setEx(k, Math.ceil(TTL_MS / 1000), payload).catch(() => void 0);
    } else {
      memStore.set(k, { status, body, expiresAt: Date.now() + TTL_MS });
    }
    return originalJson(body);
  };

  next();
};
