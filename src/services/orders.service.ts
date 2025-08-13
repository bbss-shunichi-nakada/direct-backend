import prisma from '../lib/prisma';

export const listMyOrders = (userId: number, limit: number, offset: number) =>
  Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { id: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

export const getMyOrder = (userId: number, id: number) =>
  prisma.order.findFirst({ where: { id, userId }, include: { product: true } });

export const createOrder = async (userId: number, productId: number, quantity: number) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;
  const total = product.price * quantity;
  return prisma.order.create({
    data: { userId, productId, quantity, total },
    include: { product: true },
  });
};

export const updateOrderQuantity = async (userId: number, id: number, quantity: number) => {
  const existing = await prisma.order.findFirst({ where: { id, userId } });
  if (!existing) return null;
  const product = await prisma.product.findUnique({ where: { id: existing.productId } });
  if (!product) return null;
  return prisma.order.update({
    where: { id },
    data: { quantity, total: product.price * quantity },
    include: { product: true },
  });
};

export const deleteMyOrder = (userId: number, id: number) =>
  prisma.order.delete({ where: { id }, select: { id: true } }); // 所有チェックはルート側でfindFirst済みを想定
