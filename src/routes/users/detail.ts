import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate, type AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/users/:id  （本人のみ）
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');
    if (req.user!.id !== id) throw new ForbiddenError('権限がありません。');

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
    if (!user) throw new NotFoundError('ユーザーが見つかりません。');

    return res.json(user);
  })
);

export default router;
