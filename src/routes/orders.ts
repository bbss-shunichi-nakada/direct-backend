import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async ({}, res) => {
  const orders = await prisma.order.findMany({
    include: { user: true, product: true },
  });
  res.status(201).json(orders);
});

router.post('/', async (req, res) => {
  const { userId, productId, quantity, total } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        user: {
          connect: { id: userId },
        },
        productId,
        product: {
          connect: { id: productId },
        },
        quantity,
        total,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order作成エラー:', error);
    res.status(500).json({ error: '注文の作成に失敗しました' });
  }
});

export default router;
