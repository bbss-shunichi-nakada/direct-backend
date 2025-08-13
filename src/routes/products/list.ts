import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/products
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.json(products);
  } catch (e) {
    console.error('商品一覧取得エラー:', e);
    return res.status(500).json({ error: '商品一覧の取得に失敗しました。' });
  }
});

export default router;
