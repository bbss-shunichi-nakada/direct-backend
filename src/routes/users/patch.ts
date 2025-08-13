import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate, type AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

const router = Router();

// PATCH /api/users/:id  （本人のみ、name のみ想定）
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');
    if (req.user!.id !== id) throw new ForbiddenError('権限がありません。');

    const { name } = req.body as { name?: string };
    if (name === undefined) throw new BadRequestError('更新対象がありません。');
    if (name !== undefined && typeof name !== 'string')
      throw new BadRequestError('name の型が不正です。');

    const user = await prisma.user.update({
      where: { id },
      data: { ...(name !== undefined && { name }) },
      select: { id: true, name: true, email: true },
    });

    return res.json(user);
  })
);

export default router;
