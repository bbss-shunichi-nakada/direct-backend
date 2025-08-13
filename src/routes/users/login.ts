import { Router } from 'express';
import prisma from '../../lib/prisma';
import { generateToken } from '../../utils/jwt';
import { verifyPassword } from '../../utils/hash';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';

const router = Router();

/** POST /api/users/login */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new BadRequestError('email, passwordは必須です。');
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('emailの形式が不正です。');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('メールアドレスまたはパスワードが不正です。');

    const stored = user.password;
    // 旧データ互換：ハッシュ($2...)なら検証、そうでなければ暫定的に平文比較
    const ok = stored.startsWith('$2')
      ? await verifyPassword(password, stored)
      : password === stored;
    if (!ok) throw new UnauthorizedError('メールアドレスまたはパスワードが不正です。');

    const token = generateToken({ userId: user.id });
    const { id, name } = user;
    return res.json({ token, user: { id, name, email } });
  })
);

export default router;
