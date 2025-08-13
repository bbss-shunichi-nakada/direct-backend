import { Router } from 'express';
import prisma from '../../lib/prisma';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, NotFoundError } from '../../utils/errors';

const router = Router();

// PUT /api/orders/:id  （quantity の全更新、totalはサーバ再計算）
router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');

    const { quantity } = req.body as { quantity?: number };
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0)
      throw new BadRequestError('quantityは1以上の整数で指定してください。');

    const order = await prisma.order.findFirst({ where: { id, userId: req.user!.id } });
    if (!order) throw new NotFoundError('注文が見つかりません。');

    const product = await prisma.product.findUnique({ where: { id: order.productId } });
    if (!product) throw new NotFoundError('商品が見つかりません。');

    const updated = await prisma.order.update({
      where: { id },
      data: { quantity: qty, total: product.price * qty },
      include: { product: true },
    });

    return res.json(updated);
  })
);

export default router;
