import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ユーザー一覧取得
router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// ユーザー作成
router.post('/', async (req, res) => {
  const { email, password, name } = req.body;
  const user = await prisma.user.create({
    data: { email, password, name },
  });
  res.status(201).json(user);
});

export default router;
