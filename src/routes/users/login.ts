import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateBody } from '../../middlewares/validate';
import { loginBody } from '../../schemas/users';
import { ok } from '../../utils/response';
import { authenticateUser } from '../../services/users.service';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { BadRequestError } from '../../utils/errors';

const router = Router();

// POST /api/users/login
router.post(
  '/login',
  validateBody(loginBody),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await authenticateUser(email, password);

    const secretEnv = process.env.JWT_SECRET;
    if (!secretEnv) throw new BadRequestError('JWT_SECRET が設定されていません。');
    const secret: Secret = secretEnv;

    const expiresEnv = process.env.JWT_EXPIRES_IN ?? '7d';
    const expiresIn: number | StringValue = /^\d+$/.test(expiresEnv)
      ? Number(expiresEnv)
      : (expiresEnv as StringValue);

    const payload = { sub: user.id, email: user.email };
    const options: SignOptions = { expiresIn };
    const token = jwt.sign(payload, secret, options);

    return ok(res, { token, user });
  })
);

export default router;
