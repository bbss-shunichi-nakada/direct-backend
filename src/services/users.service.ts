import prisma from '../lib/prisma';
import { hashPassword, verifyPassword } from '../utils/hash';

export const findByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const createUser = async (email: string, password: string, name = '') => {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: { email, password: passwordHash, name },
    select: { id: true, name: true, email: true },
  });
};

export const validateLogin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = user.password.startsWith('$2')
    ? await verifyPassword(password, user.password)
    : password === user.password;
  return ok ? user : null;
};

export const getMe = (id: number) =>
  prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });

export const getByIdForOwner = (id: number, ownerId: number) =>
  ownerId !== id
    ? null
    : prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });

export const updateUserName = (id: number, name: string) =>
  prisma.user.update({
    where: { id },
    data: { name },
    select: { id: true, name: true, email: true },
  });

export const deleteIfNoOrders = async (id: number) => {
  const count = await prisma.order.count({ where: { userId: id } });
  if (count > 0) return false;
  await prisma.user.delete({ where: { id } });
  return true;
};
