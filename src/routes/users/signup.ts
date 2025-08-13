import { Router } from 'express';
import prisma from '../../lib/prisma';
import { hashPassword } from '../../utils/hash';
import type { Request, Response } from 'express';

const router = Router();

/**
 * POST /api/users/signup
 * フロントの signupSchema に合わせたペイロードを受け取るが、
 * 現時点では DB 上は email/password/name のみ保存。
 */
router.post('/signup', async (req: Request, res: Response) => {
  const {
    email,
    password,
    name, // DBに保存（String 必須。空文字でもOK）
    kana, // 受け取るが今回未保存
    postalCode, // 受け取るが今回未保存
    prefecture, // 受け取るが今回未保存
    address1, // 受け取るが今回未保存
    address2, // 受け取るが今回未保存
    phone, // 受け取るが今回未保存
    newsletter, // 受け取るが今回未保存
  } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    kana?: string;
    postalCode?: string;
    prefecture?: string;
    address1?: string;
    address2?: string;
    phone?: string;
    newsletter?: boolean;
  };

  // 最小限のサーバ側チェック（フロントはzodで実施予定）
  if (!email || !password) {
    return res.status(400).json({ error: 'email, passwordは必須です。' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'パスワードは6文字以上で入力してください。' });
  }
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'emailの形式が不正です。' });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'このemailは既に登録されています。' });
    }

    const passwordHash = await hashPassword(password);

    // name は schema.prisma で必須(String)なので、未指定なら空文字を入れる
    const saved = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: name ?? '', // 空文字許容
      },
      select: { id: true, name: true, email: true },
    });

    // 受け取った追加項目は現時点では保存しない（将来プロファイル拡張で対応）
    // 例: UserProfile を追加し、ここで一緒に作成する実装に拡張可能

    return res.status(201).json(saved);
  } catch (e) {
    console.error('ユーザー作成エラー:', e);
    return res.status(500).json({ error: 'ユーザーの作成に失敗しました。' });
  }
});

export default router;
