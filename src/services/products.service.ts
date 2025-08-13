import prisma from '../lib/prisma';

export const listProducts = (limit: number, offset: number) =>
  Promise.all([
    prisma.product.findMany({ skip: offset, take: limit, orderBy: { id: 'desc' } }),
    prisma.product.count(),
  ]);

export const getProduct = (id: number) => prisma.product.findUnique({ where: { id } });
