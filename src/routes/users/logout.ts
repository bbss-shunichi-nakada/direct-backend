// src/routes/users/logout.ts
import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { authenticate } from '../../middlewares/auth';
import { ok } from '../../utils/response';
import { revokeAllUserRefreshTokens } from '../../services/tokens.service';
import { refreshCookieOptions } from '../../utils/cookies';
import { env } from '../../config/env';

const router = Router();

router.post('/logout', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await revokeAllUserRefreshTokens(req.user!.id);
    res.clearCookie(env.REFRESH_TOKEN_COOKIE, refreshCookieOptions());
    return ok(res, { ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
