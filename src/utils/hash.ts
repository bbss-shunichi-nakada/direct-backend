import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * パスワードをハッシュ化する
 */
export const hashPassword = async (plain: string): Promise<string> => {
  return await bcrypt.hash(plain, SALT_ROUNDS);
};

/**
 * パスワードのハッシュと平文を比較して一致確認
 */
export const verifyPassword = async (plain: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hash);
};
