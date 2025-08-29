import rateLimit, { Options } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';
import { env } from '../config/env';

let store: any | undefined;
if (env.REDIS_URL) {
  const client = createClient({ url: env.REDIS_URL });
  // 起動時に接続（失敗してもメモリにフォールバック）
  client.connect().catch((e) => {
    // eslint-disable-next-line no-console
    console.error('[rateLimit] Redis connect error, fallback to memory:', e.message);
  });
  store = new RedisStore({
    sendCommand: (...args: string[]) => client.sendCommand(args),
  });
}

export const createLimiter = (opts: Partial<Options>) =>
  rateLimit({
    windowMs: 60_000,
    max: 120, // デフォルト(分間)
    standardHeaders: true,
    legacyHeaders: false,
    store,
    ...opts,
  });

// 全体用（必要なら index.ts で app.use に適用）
export const generalLimiter = createLimiter({
  windowMs: 60_000,
  max: 120,
});

// /login専用（厳しめ）
export const loginLimiter = createLimiter({
  windowMs: 5 * 60_000,
  max: 5,
  message: { error: '試行回数が多すぎます。しばらくしてから再度お試しください。' },
});
