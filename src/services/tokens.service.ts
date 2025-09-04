import { randomUUID } from 'crypto';
import prisma from '../lib/prisma';
import { signRefreshToken, verifyRefreshToken } from '../utils/refresh';
import { generateToken } from '../utils/jwt'; // アクセストークン
import { UnauthorizedError } from '../utils/errors';

export const issueTokenPair = async (
  userId: number,
  email: string,
  meta?: { ua?: string; ip?: string }
) => {
  const jti = randomUUID();
  const refresh = signRefreshToken({ jti, sub: String(userId) });
  const decoded = verifyRefreshToken(refresh); // exp 取得のため一旦decode
  const expiresAt = new Date((decoded.exp ?? 0) * 1000);

  await prisma.refreshToken.create({
    data: {
      jti,
      userId,
      expiresAt,
      userAgent: meta?.ua,
      ip: meta?.ip,
    },
  });

  const access = generateToken({ userId, email });
  return { access, refresh };
};

export const rotateRefreshToken = async (oldToken: string, meta?: { ua?: string; ip?: string }) => {
  const decoded = verifyRefreshToken(oldToken);
  const token = await prisma.refreshToken.findUnique({ where: { jti: decoded.jti } });
  if (!token || token.revokedAt) throw new UnauthorizedError('Refresh token is invalid.');
  if (token.expiresAt < new Date()) throw new UnauthorizedError('Refresh token expired.');

  // 旧トークンを無効化し、新JTIを発行
  const newJti = randomUUID();
  const newRefresh = signRefreshToken({ jti: newJti, sub: decoded.sub });
  const newDecoded = verifyRefreshToken(newRefresh);
  const newExpiresAt = new Date((newDecoded.exp ?? 0) * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { jti: token.jti },
      data: { revokedAt: new Date(), replacedBy: newJti },
    });
    await tx.refreshToken.create({
      data: {
        jti: newJti,
        userId: token.userId,
        expiresAt: newExpiresAt,
        userAgent: meta?.ua,
        ip: meta?.ip,
      },
    });
  });

  const access = generateToken({ userId: token.userId, email: '' }); // email は呼び出し元で埋めることも可
  return { access, refresh: newRefresh, userId: token.userId };
};

export const revokeAllUserRefreshTokens = async (userId: number) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const revokeRefreshToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  const token = await prisma.refreshToken.findUnique({ where: { jti: decoded.jti } });
  if (!token) throw new UnauthorizedError('Refresh token is invalid.');
  await prisma.refreshToken.update({
    where: { jti: decoded.jti },
    data: { revokedAt: new Date() },
  });
};
