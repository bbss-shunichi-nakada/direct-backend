import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ログイン（バリデーション・エラーハンドリング付き）
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  // 入力値のバリデーション
  if (!email || !password) {
    return res.status(400).json({ error: 'email, passwordは必須です。' });
  }
  // email形式チェック（簡易）
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'emailの形式が不正です。' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
    }
    // パスワードはハッシュ化して比較することが推奨
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'ログインに失敗しました。' });
  }
});

export default router;
