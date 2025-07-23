import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 商品一覧取得（エラーハンドリング付き）
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('商品一覧取得エラー:', error);
    res.status(500).json({ error: '商品一覧の取得に失敗しました。' });
  }
});

// 商品作成（バリデーション・エラーハンドリング付き）
router.post('/', async (req, res) => {
  const { name, price } = req.body;
  // 入力値のバリデーション
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name, priceは必須です。' });
  }
  if (typeof price !== 'number' && isNaN(Number(price))) {
    return res.status(400).json({ error: 'priceは数値で入力してください。' });
  }
  try {
    // 商品名重複チェック（必要に応じて）
    const existingProduct = await prisma.product.findFirst({ where: { name } });
    if (existingProduct) {
      return res.status(409).json({ error: 'この商品名は既に登録されています。' });
    }
    const product = await prisma.product.create({
      data: { name, price: Number(price) },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('商品作成エラー:', error);
    res.status(500).json({ error: '商品の作成に失敗しました。' });
  }
});

export default router;
