import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env';

export interface RefreshSignPayload {
  jti: string;     // RefreshToken の識別子
  sub: string;     // ユーザーID（文字列）
}

interface RefreshClaims extends JwtPayload {
  jti: string;
  sub: string;
}

const secret: Secret = env.JWT_SECRET;
const expiresIn: number | StringValue =
  typeof env.REFRESH_TOKEN_EXPIRES_IN === 'number'
    ? env.REFRESH_TOKEN_EXPIRES_IN
    : (env.REFRESH_TOKEN_EXPIRES_IN as StringValue);

export const signRefreshToken = (p: RefreshSignPayload) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(p, secret, options);
};

export const verifyRefreshToken = (token: string): RefreshClaims => {
  return jwt.verify(token, secret) as RefreshClaims;
};
