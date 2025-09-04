import { Router } from 'express';
import prisma from '../../lib/prisma';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError } from '../../utils/errors';
import { encodeCursor, decodeCursor } from '../../utils/cursor';

const router = Router();

/**
 * GET /api/products?limit=20&offset=0&cursor=<base64>
 * - 既存: limit/offset そのまま動作
 * - 追加: cursor があればそれを優先（id DESC のキーセット）
 * - レスポンス: nextCursor を常に含める（未満なら null）
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isFinite(limit) || !Number.isFinite(offset) || limit <= 0 || offset < 0) {
      throw new BadRequestError('limit/offsetの指定が不正です。');
    }

    const cursorStr = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const afterId = cursorStr ? decodeCursor(cursorStr) : undefined;

    let items;
    if (afterId) {
      // キーセットページング（id DESC）
      items = await prisma.product.findMany({
        where: { id: { lt: afterId } },
        orderBy: { id: 'desc' },
        take: limit,
      });
    } else {
      // 既存の offset 方式を維持
      items = await prisma.product.findMany({
        skip: offset,
        take: limit,
        orderBy: { id: 'desc' },
      });
    }

    const total = await prisma.product.count();
    const nextCursor = items.length === limit ? encodeCursor(items[items.length - 1].id) : null;

    return res.json({
      items,
      total,
      limit,
      offset,
      cursor: cursorStr ?? null,
      nextCursor,
    });
  })
);

export default router;
