import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

// 返却時に password は含めない
const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: userPublicSelect,
  });
};

export const updateUser = async (id: number, data: { name: string; email: string }) => {
  // email の重複チェック（自分以外）
  const dup = await prisma.user.findFirst({
    where: { email: data.email, NOT: { id } },
    select: { id: true },
  });
  if (dup) throw new ConflictError('このメールアドレスは既に利用されています。');

  return prisma.user.update({
    where: { id },
    data: { name: data.name, email: data.email },
    select: userPublicSelect,
  });
};

export const patchUser = async (id: number, data: { name?: string; email?: string }) => {
  if (data.email) {
    const dup = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
      select: { id: true },
    });
    if (dup) throw new ConflictError('このメールアドレスは既に利用されています。');
  }
  return prisma.user.update({
    where: { id },
    data,
    select: userPublicSelect,
  });
};

export const removeUser = async (id: number) => {
  // 将来：論理削除にするならここで対応
  await prisma.user.delete({ where: { id } });
  return { id };
};

type SignupInput = {
  email: string;
  password: string;
  name?: string;
  kana?: string;
  postalCode?: string;
  prefecture?: string;
  address1?: string;
  address2?: string;
  phone?: string;
  newsletter?: boolean;
};

/** サインアップ：重複メールを弾き、bcryptでハッシュ化して作成 */
export const createUser = async (input: SignupInput) => {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new ConflictError('このメールアドレスは既に利用されています。');

  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);

  // いまは User テーブルに存在するカラムのみ保存（name, email, password など）
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashed,
      name: input.name ?? '',
    },
    select: userPublicSelect,
  });

  return user;
};

/** ログイン：email/password を検証して user を返す（トークンはルート側で発行） */
export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password)
    throw new UnauthorizedError('メールアドレスまたはパスワードが違います。');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new UnauthorizedError('メールアドレスまたはパスワードが違います。');

  // 公開項目に整形して返す
  const pub = await prisma.user.findUnique({
    where: { id: user.id },
    select: userPublicSelect,
  });
  if (!pub) throw new NotFoundError('ユーザーが見つかりません。'); // 理論上起きない

  return pub;
};
