import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export const listProducts = async (
  limit: number,
  offset: number,
  q = '',
  sort: ProductSort = 'newest'
) => {
  const where: Prisma.ProductWhereInput = q
    ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] }
    : {};

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_asc'
      ? { price: 'asc' as const }
      : sort === 'price_desc'
      ? { price: 'desc' as const }
      : sort === 'name_asc'
      ? { name: 'asc' as const }
      : sort === 'name_desc'
      ? { name: 'desc' as const }
      : { createdAt: 'desc' as const };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: offset, take: limit }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
};

export const getProduct = async (id: number) => {
  const product = await prisma.product.findUnique({ where: { id } });
  return product;
};

type ProductUpdate = {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
};

export const updateProduct = async (id: number, data: ProductUpdate) => {
  const updated = await prisma.product.update({
    where: { id },
    data,
  });
  return updated;
};

type ProductPatch = Partial<ProductUpdate>;

export const patchProduct = async (id: number, data: ProductPatch) => {
  const updated = await prisma.product.update({
    where: { id },
    data,
  });
  return updated;
};

export const removeProduct = async (id: number) => {
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new NotFoundError('商品が見つかりません。');
  await prisma.product.delete({ where: { id } });
  return { id };
};
