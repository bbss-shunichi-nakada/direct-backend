import { Router } from 'express';
import { ok } from '../../utils/response';
import { rotateRefreshToken } from '../../services/tokens.service';
import { verifyRefreshToken } from '../../utils/refresh';
import { refreshCookieOptions } from '../../utils/cookies';
import { env } from '../../config/env';

const router = Router();

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken =
      (req.cookies?.[env.REFRESH_TOKEN_COOKIE] as string) || (req.body?.refreshToken as string);
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });

    const meta = { ua: req.headers['user-agent'] as string, ip: req.ip };
    const rotated = await rotateRefreshToken(refreshToken, meta);

    // Cookie 再セット（ローテーション）
    const decoded = verifyRefreshToken(rotated.refresh);
    const maxAgeMs = decoded.exp ? Math.max(0, decoded.exp * 1000 - Date.now()) : undefined;
    res.cookie(env.REFRESH_TOKEN_COOKIE, rotated.refresh, refreshCookieOptions(maxAgeMs));

    return ok(res, { accessToken: rotated.access });
  } catch (e) {
    next(e);
  }
});

export default router;
