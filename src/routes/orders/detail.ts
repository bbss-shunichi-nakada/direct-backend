import { Router } from 'express';
import prisma from '../../lib/prisma';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/orders/:id  （自分の注文のみ）
router.get(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
      include: { product: true },
    });
    if (!order) throw new NotFoundError('注文が見つかりません。');

    return res.json(order);
  })
);

export default router;
