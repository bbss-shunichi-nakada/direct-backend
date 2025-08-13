import { Router } from 'express';
import prisma from '../../lib/prisma';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, NotFoundError } from '../../utils/errors';

const router = Router();

// DELETE /api/orders/:id  （自分の注文のみ削除可）
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');

    // 所有確認
    const order = await prisma.order.findFirst({ where: { id, userId: req.user!.id } });
    if (!order) throw new NotFoundError('注文が見つかりません。');

    await prisma.order.delete({ where: { id } });
    return res.status(204).end();
  })
);

export default router;
