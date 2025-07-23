import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ユーザー一覧取得
// ユーザー一覧取得（エラーハンドリング付き）
router.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    res.status(500).json({ error: 'ユーザー一覧の取得に失敗しました。' });
  }
});

// ユーザー作成（バリデーション・エラーハンドリング付き）
router.post('/', async (req, res) => {
  const { email, password, name } = req.body;
  // 入力値のバリデーション
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, nameは必須です。' });
  }
  // email形式チェック（簡易）
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'emailの形式が不正です。' });
  }
  try {
    // email重複チェック
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'このemailは既に登録されています。' });
    }
    // パスワードはハッシュ化することが推奨（ここでは平文保存例）
    // 実運用ではbcrypt等でハッシュ化してください
    const user = await prisma.user.create({
      data: { email, password, name },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    res.status(500).json({ error: 'ユーザーの作成に失敗しました。' });
  }
});

export default router;
