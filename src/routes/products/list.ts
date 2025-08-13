import { Router } from 'express';
import prisma from '../../lib/prisma';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/products?limit=20&offset=0
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);
    if (limit <= 0 || offset < 0) throw new BadRequestError('limit/offsetの指定が不正です。');

    const [items, total] = await Promise.all([
      prisma.product.findMany({ skip: offset, take: limit, orderBy: { id: 'desc' } }),
      prisma.product.count(),
    ]);

    return res.json({ items, total });
  })
);

export default router;
