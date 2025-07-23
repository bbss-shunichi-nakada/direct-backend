import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'メールアドレスとパスワードを入力してください。' });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません。' });
  }

  return res.json({ id: user.id, name: user.name, email: user.email });
});

export default router;
