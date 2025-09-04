// src/routes/users/login.ts
import { Router } from 'express';
import { validateBody } from '../../middlewares/validate';
import { loginBody } from '../../schemas/users';
import { ok } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { authenticateUser } from '../../services/users.service';
import { loginLimiter } from '../../middlewares/rateLimit';
import { issueTokenPair } from '../../services/tokens.service';
import { verifyRefreshToken } from '../../utils/refresh';
import { refreshCookieOptions } from '../../utils/cookies';
import { env } from '../../config/env';

const router = Router();

router.post('/login', loginLimiter, validateBody(loginBody), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    if (!user) throw new UnauthorizedError('メールアドレスまたはパスワードが不正です。');

    const meta = { ua: req.headers['user-agent'] as string, ip: req.ip };
    const { access, refresh } = await issueTokenPair(user.id, user.email, meta);

    const decoded = verifyRefreshToken(refresh);
    const maxAgeMs = decoded.exp ? Math.max(0, decoded.exp * 1000 - Date.now()) : undefined;
    res.cookie(env.REFRESH_TOKEN_COOKIE, refresh, refreshCookieOptions(maxAgeMs));

    return ok(res, { accessToken: access, user });
  } catch (e) {
    next(e);
  }
});

export default router;
