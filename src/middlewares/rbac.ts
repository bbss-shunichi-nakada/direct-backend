import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const requireAdmin = async (req: any, _res: Response, next: NextFunction) => {
  // AuthenticatedRequest で id は入っている想定
  const id: number | undefined = req.user?.id;
  if (!id) return next(new Error('Unauthorized'));
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user || user.role !== 'ADMIN') return next(new Error('Forbidden'));
  next();
};
