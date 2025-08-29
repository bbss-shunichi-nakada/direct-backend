import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';

export type OrderSort = 'newest' | 'total_asc' | 'total_desc';

/** 自分の注文一覧（検索/ソート対応、items.product を含めて返却） */
export const listMyOrders = async (
  userId: number,
  limit: number,
  offset: number,
  q = '',
  sort: OrderSort = 'newest'
) => {
  const where: Prisma.OrderWhereInput = {
    userId,
    ...(q ? { items: { some: { product: { name: { contains: q } } } } } : {}),
  };

  const orderBy: Prisma.OrderOrderByWithRelationInput =
    sort === 'total_asc'
      ? { total: 'asc' as const }
      : sort === 'total_desc'
      ? { total: 'desc' as const }
      : { createdAt: 'desc' as const };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      include: { items: { include: { product: true } } },
      skip: offset,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total };
};

/** 自分の注文1件（items.product 付き） */
export const getMyOrder = (userId: number, id: number) =>
  prisma.order.findFirst({
    where: { id, userId },
    include: { items: { include: { product: true } } },
  });

/** 1注文=1商品（簡易API）で新規作成。在庫引当と total 確定をトランザクションで実施 */
export const createOrder = async (userId: number, productId: number, quantity: number) => {
  if (quantity <= 0) throw new BadRequestError('quantityは1以上で指定してください。');

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('商品が見つかりません。');
    if (product.stock < quantity) throw new ConflictError('在庫が不足しています。');

    const unitPrice = product.price;
    const lineTotal = unitPrice * quantity;
    const total = lineTotal;

    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    const order = await tx.order.create({
      data: {
        userId,
        total,
        items: { create: [{ productId, quantity, unitPrice, lineTotal }] },
      },
      include: { items: { include: { product: true } } },
    });

    return order;
  });
};

/** 1アイテム注文前提の数量更新（互換API） */
export const updateOrderQuantity = async (userId: number, orderId: number, newQty: number) => {
  if (!Number.isInteger(newQty) || newQty <= 0) {
    throw new BadRequestError('quantityは1以上の整数で指定してください。');
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError('注文が見つかりません。');
    if (order.items.length !== 1) {
      throw new ConflictError('複数アイテムの注文はこのAPIでは更新できません。');
    }

    const item = order.items[0];
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new NotFoundError('商品が見つかりません。');

    const delta = newQty - item.quantity;
    if (delta > 0) {
      if (product.stock < delta) throw new ConflictError('在庫が不足しています。');
      await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: delta } } });
    } else if (delta < 0) {
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { increment: -delta } },
      });
    }

    const lineTotal = product.price * newQty;

    await tx.orderItem.update({
      where: { id: item.id },
      data: { quantity: newQty, unitPrice: product.price, lineTotal },
    });

    const sum = await tx.orderItem.aggregate({
      where: { orderId },
      _sum: { lineTotal: true },
    });

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { total: sum._sum.lineTotal ?? 0 },
      include: { items: { include: { product: true } } },
    });

    return updated;
  });
};

/**
 * 注文中の特定アイテムの数量を更新（複数アイテム対応）。
 * 受注時の unitPrice は固定し、数量変更時は lineTotal のみ再計算。
 * 在庫は差分で増減。Order.total は items の合計で再計算して保存。
 */
export const updateOrderItemQuantity = async (
  userId: number,
  orderId: number,
  itemId: number,
  newQty: number
) => {
  if (!Number.isInteger(newQty) || newQty <= 0) {
    throw new BadRequestError('quantityは1以上の整数で指定してください。');
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError('注文が見つかりません。');

    const item = order.items.find((it) => it.id === itemId);
    if (!item) throw new NotFoundError('注文アイテムが見つかりません。');

    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new NotFoundError('商品が見つかりません。');

    const delta = newQty - item.quantity;
    if (delta > 0) {
      if (product.stock < delta) throw new ConflictError('在庫が不足しています。');
      await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: delta } } });
    } else if (delta < 0) {
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { increment: -delta } },
      });
    }

    const unitPrice = item.unitPrice; // 受注スナップショットを維持
    const lineTotal = unitPrice * newQty;

    await tx.orderItem.update({
      where: { id: item.id },
      data: { quantity: newQty, lineTotal },
    });

    const sum = await tx.orderItem.aggregate({
      where: { orderId },
      _sum: { lineTotal: true },
    });

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { total: sum._sum.lineTotal ?? 0 },
      include: { items: { include: { product: true } } },
    });

    return updated;
  });
};

/** 自分の注文削除（在庫を戻してから削除） */
export const deleteMyOrder = async (userId: number, orderId: number) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError('注文が見つかりません。');

    for (const it of order.items) {
      await tx.product.update({
        where: { id: it.productId },
        data: { stock: { increment: it.quantity } },
      });
    }

    await tx.order.delete({ where: { id: orderId } });
    return { id: orderId };
  });
};
