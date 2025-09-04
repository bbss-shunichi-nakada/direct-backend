import type { CookieOptions } from 'express';
import { env } from '../config/env';

export const refreshCookieOptions = (maxAgeMs?: number): CookieOptions => {
  const secure = env.NODE_ENV === 'production';
  const sameSite = env.COOKIE_SAME_SITE; // 'lax' | 'strict' | 'none'
  return {
    httpOnly: true,
    secure: sameSite === 'none' ? true : secure, // none のときは必ず true
    sameSite,
    path: env.REFRESH_COOKIE_PATH,
    domain: env.COOKIE_DOMAIN || undefined,
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
};
