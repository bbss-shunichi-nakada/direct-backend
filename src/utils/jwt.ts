import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1h'

interface Payload {
  userId: number
}

/**
 * JWTトークンを生成する
 */
export const generateToken = (payload: Payload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  })
}

/**
 * トークンからpayloadを復号する
 */
export const verifyToken = (token: string): Payload => {
  return jwt.verify(token, JWT_SECRET) as Payload
}
