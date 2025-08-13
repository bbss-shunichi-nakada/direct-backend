import { Router } from 'express';
import prisma from '../../lib/prisma';
import { hashPassword } from '../../utils/hash';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, ConflictError } from '../../utils/errors';

const router = Router();

/**
 * POST /api/users/signup
 * フロントの signupSchema 形式を受け取るが、DB保存は email/password/name のみ
 */
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const {
      email,
      password,
      name,
      // 以下は受け取るが現状は未保存（将来 UserProfile 等へ）
      kana,
      postalCode,
      prefecture,
      address1,
      address2,
      phone,
      newsletter,
    } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      kana?: string;
      postalCode?: string;
      prefecture?: string;
      address1?: string;
      address2?: string;
      phone?: string;
      newsletter?: boolean;
    };

    if (!email || !password) {
      throw new BadRequestError('email, passwordは必須です。');
    }
    if (password.length < 6) {
      throw new BadRequestError('パスワードは6文字以上で入力してください。');
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('emailの形式が不正です。');
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictError('このemailは既に登録されています。');

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: name ?? '',
      },
      select: { id: true, name: true, email: true },
    });

    return res.status(201).json(user);
  })
);

export default router;
