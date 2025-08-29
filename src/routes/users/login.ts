import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateBody } from '../../middlewares/validate';
import { loginBody } from '../../schemas/users';
import { ok } from '../../utils/response';
import { authenticateUser } from '../../services/users.service';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { loginLimiter } from '../../middlewares/rateLimit';
import { env } from '../../config/env';

const router = Router();

// POST /api/users/login
router.post(
  '/login',
  loginLimiter,
  validateBody(loginBody),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    const secret: Secret = env.JWT_SECRET;
    const expiresIn: number | StringValue =
      typeof env.JWT_EXPIRES_IN === 'number'
        ? env.JWT_EXPIRES_IN
        : (env.JWT_EXPIRES_IN as StringValue);

    const payload = { sub: user.id, email: user.email };
    const options: SignOptions = { expiresIn };
    const token = jwt.sign(payload, secret, options);

    return ok(res, { token, user });
  })
);

export default router;
