import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 注文一覧取得（エラーハンドリング付き）
router.get('/', async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, product: true },
    });
    res.json(orders);
  } catch (error) {
    console.error('注文一覧取得エラー:', error);
    res.status(500).json({ error: '注文一覧の取得に失敗しました。' });
  }
});

// 注文作成（バリデーション・エラーハンドリング付き）
router.post('/', async (req, res) => {
  const { userId, productId, quantity, total } = req.body;
  // 入力値のバリデーション
  if (!userId || !productId || quantity === undefined || total === undefined) {
    return res.status(400).json({ error: 'userId, productId, quantity, totalは必須です。' });
  }
  if (isNaN(Number(quantity)) || isNaN(Number(total))) {
    return res.status(400).json({ error: 'quantity, totalは数値で入力してください。' });
  }
  try {
    // ユーザー・商品存在チェック
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!user || !product) {
      return res.status(404).json({ error: 'ユーザーまたは商品が存在しません。' });
    }
    const order = await prisma.order.create({
      data: {
        userId,
        user: { connect: { id: userId } },
        productId,
        product: { connect: { id: productId } },
        quantity: Number(quantity),
        total: Number(total),
      },
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('注文作成エラー:', error);
    res.status(500).json({ error: '注文の作成に失敗しました。' });
  }
});

export default router;
