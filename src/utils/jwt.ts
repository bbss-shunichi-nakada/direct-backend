import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

interface Payload {
  userId: number;
}

/**
 * JWTトークンを生成する
 */
export const generateToken = (payload: Payload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * トークンからpayloadを復号する
 */
export const verifyToken = (token: string): Payload => {
  return jwt.verify(token, JWT_SECRET) as Payload;
};
