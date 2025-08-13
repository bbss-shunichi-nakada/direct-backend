import express from 'express';
import prisma from '../../lib/prisma';
import { verifyPassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

const router = express.Router();

/**
 * POST /api/login
 * body: { email: string, password: string }
 * 成功: { token: string, user: { id, name, email } }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'email, passwordは必須です。' });
  }
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'emailの形式が不正です。' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが不正です。' });
    }

    const stored = user.password;

    // 既存データ移行の便宜: もし平文が混在していた場合のフォールバック
    // bcryptハッシュ形式は "$2" で始まる
    let ok = false;
    if (stored.startsWith('$2')) {
      ok = await verifyPassword(password, stored);
    } else {
      // 平文時代のデータ互換（早期に全ユーザーの再ハッシュ移行を推奨）
      ok = password === stored;
    }

    if (!ok) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが不正です。' });
    }

    const token = generateToken({ userId: user.id });
    // パスワードは返さない
    const { id, name } = user;
    return res.json({ token, user: { id, name, email } });
  } catch (e) {
    console.error('ログインエラー:', e);
    return res.status(500).json({ error: 'ログインに失敗しました。' });
  }
});

export default router;
