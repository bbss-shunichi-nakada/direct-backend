import { Router } from 'express';
import prisma from '../../lib/prisma';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError } from '../../utils/errors';
import type { AuthenticatedRequest } from '../../middlewares/auth';

const router = Router();

// GET /api/orders?limit=20&offset=0  （認証必須：index側でauthenticate適用想定）
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const limitRaw = req.query.limit as string | undefined;
    const offsetRaw = req.query.offset as string | undefined;

    const limit = limitRaw === undefined ? 20 : Number(limitRaw);
    const offset = offsetRaw === undefined ? 0 : Number(offsetRaw);

    if (!Number.isInteger(limit) || limit <= 0) {
      throw new BadRequestError('limitは1以上の整数で指定してください。');
    }
    if (!Number.isInteger(offset) || offset < 0) {
      throw new BadRequestError('offsetは0以上の整数で指定してください。');
    }

    const userId = req.user!.id;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { id: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return res.json({ items, total, limit, offset });
  })
);

export default router;
