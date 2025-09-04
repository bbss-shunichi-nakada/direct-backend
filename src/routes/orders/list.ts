import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError } from '../../utils/errors';
import { listMyOrders } from '../../services/orders.service';
import { encodeCursor } from '../../utils/cursor';

const router = Router();

/**
 * GET /api/orders?limit=20&offset=0&q=&sort=newest&cursor=<base64>
 * - いまは既存サービス（offset方式）を使い続ける
 * - フロント将来移行のため nextCursor を返す（limitちょうどなら最後のidから生成）
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isFinite(limit) || !Number.isFinite(offset) || limit <= 0 || offset < 0) {
      throw new BadRequestError('limit/offsetの指定が不正です。');
    }
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const sortParam = (typeof req.query.sort === 'string' ? req.query.sort : 'newest') as any;

    const { items, total } = await listMyOrders(req.user!.id, limit, offset, q, sortParam);

    const nextCursor = items.length === limit ? encodeCursor(items[items.length - 1].id) : null;

    return res.json({
      items,
      total,
      limit,
      offset,
      q,
      sort: sortParam,
      cursor: null, // 受け付けはするが現状は offset 運用
      nextCursor,
    });
  })
);

export default router;
