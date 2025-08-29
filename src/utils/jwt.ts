import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env';

/** サイン時に渡すアプリ都合の入力型（数値IDを使いやすく） */
export interface SignPayload {
  userId: number;
  email: string;
}

/** トークン内に実際に入る「標準クレーム＋カスタム」型（sub は仕様上 string） */
interface TokenClaims extends JwtPayload {
  sub: string; // ← JWT標準では文字列。数値IDは文字列化して入れる
  email?: string;
}

/** verify 後にアプリで扱いやすい形（userId を number に戻す） */
export interface DecodedToken {
  userId: number;
  email?: string;
  iat?: number;
  exp?: number;
  raw: TokenClaims; // 生のクレームにアクセスしたい場合用
}

const secret: Secret = env.JWT_SECRET;
const expiresIn: number | StringValue =
  typeof env.JWT_EXPIRES_IN === 'number' ? env.JWT_EXPIRES_IN : (env.JWT_EXPIRES_IN as StringValue);

/** JWTトークンを生成（sub に userId を文字列で格納） */
export const generateToken = (payload: SignPayload): string => {
  const claims: TokenClaims = {
    sub: String(payload.userId),
    email: payload.email,
  };
  const options: SignOptions = { expiresIn };
  return jwt.sign(claims, secret, options);
};

/** JWTトークンを検証し、数値 userId を含む形で返す（失敗時は例外） */
export const verifyToken = (token: string): DecodedToken => {
  const decoded = jwt.verify(token, secret) as TokenClaims;
  const userId = Number(decoded.sub);
  if (!Number.isFinite(userId)) {
    throw new Error('Invalid token payload: sub is not a numeric user id');
  }
  return {
    userId,
    email: decoded.email,
    iat: decoded.iat,
    exp: decoded.exp,
    raw: decoded,
  };
};
