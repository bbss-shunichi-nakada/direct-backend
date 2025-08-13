import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'idの形式が不正です。' });
  }
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: '商品が見つかりません。' });
    return res.json(product);
  } catch (e) {
    console.error('商品詳細取得エラー:', e);
    return res.status(500).json({ error: '商品詳細の取得に失敗しました。' });
  }
});

export default router;
