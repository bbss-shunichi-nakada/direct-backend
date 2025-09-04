// src/routes/users/logoutOne.ts
import { Router } from 'express';
import { ok } from '../../utils/response';
import { revokeRefreshToken } from '../../services/tokens.service';
import { env } from '../../config/env';
import { refreshCookieOptions } from '../../utils/cookies';

const router = Router();

router.post('/logoutone', async (req, res, next) => {
  try {
    const token =
      (req.body?.refreshToken as string) || (req.cookies?.[env.REFRESH_TOKEN_COOKIE] as string);
    if (!token) return res.status(400).json({ error: 'refreshToken is required' });

    await revokeRefreshToken(token);
    res.clearCookie(env.REFRESH_TOKEN_COOKIE, refreshCookieOptions());
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
