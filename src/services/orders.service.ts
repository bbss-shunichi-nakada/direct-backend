import prisma from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';

export type OrderSort = 'newest' | 'total_asc' | 'total_desc';

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

  // ✅ 型注釈で Prisma の orderBy 型に合わせる
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

/**
 * 一覧（自分の注文のみ）
 * V2: items(+product) を含めて返す
 */
// export const listMyOrders = (userId: number, limit: number, offset: number) =>
//   Promise.all([
//     prisma.order.findMany({
//       where: { userId },
//       include: { items: { include: { product: true } } },
//       orderBy: { id: 'desc' },
//       skip: offset,
//       take: limit,
//     }),
//     prisma.order.count({ where: { userId } }),
//   ]);

/** 1件取得（自分の注文のみ、items(+product) 付き） */
export const getMyOrder = (userId: number, id: number) =>
  prisma.order.findFirst({
    where: { id, userId },
    include: { items: { include: { product: true } } },
  });

/**
 * 作成（1注文=1商品の簡易API）
 * - 在庫チェック→引当
 * - Order + OrderItem 作成
 * - total を確定保存
 */
export const createOrder = async (userId: number, productId: number, quantity: number) => {
  if (quantity <= 0) throw new BadRequestError('quantityは1以上で指定してください。');
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('商品が見つかりません。');
    if (product.stock < quantity) throw new ConflictError('在庫が不足しています。');

    const unitPrice = product.price;
    const lineTotal = unitPrice * quantity;
    const total = lineTotal;

    // 在庫引当
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    const order = await tx.order.create({
      data: {
        userId,
        total,
        items: {
          create: [{ productId, quantity, unitPrice, lineTotal }],
        },
      },
      include: { items: { include: { product: true } } },
    });
    return order;
  });
};

/**
 * 数量更新（1注文=1アイテム前提の簡易API）
 * - 在庫を差分で調整
 * - lineTotal と total を再計算
 */
export const updateOrderQuantity = async (userId: number, orderId: number, newQty: number) => {
  if (!Number.isInteger(newQty) || newQty <= 0)
    throw new BadRequestError('quantityは1以上の整数で指定してください。');

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
      // 数量増 → 在庫が足りるかを確認して引当
      if (product.stock < delta) throw new ConflictError('在庫が不足しています。');
      await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: delta } } });
    } else if (delta < 0) {
      // 数量減 → 在庫を戻す
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

    // 合計を再計算
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
 * 注文中の特定アイテムの数量を更新します（ユーザー所有の注文のみ）。
 *
 * ビジネスルール:
 * - newQty は 1 以上の整数であること。
 * - 受注時点の単価（unitPrice）は固定し、数量変更時も変えません。
 *   → lineTotal = unitPrice * newQty を再計算して保存します。
 * - 在庫(stock)は「差分(delta)」で調整します。
 *   - 数量が増える (delta > 0): 在庫が足りるか確認 → decrement
 *   - 数量が減る (delta < 0): 余剰分を在庫に戻す → increment
 * - Order.total は全 OrderItem の lineTotal 合計で再計算してから保存します。
 *
 * トランザクション:
 * - すべての更新（在庫調整 / OrderItem 更新 / Order 合計更新）を1つの
 *   prisma.$transaction 内で実施し、整合性を担保します。
 *
 * エラー:
 * - BadRequestError: newQty が不正（整数でない/1未満）
 * - NotFoundError: 注文/アイテム/商品が見つからない
 * - ConflictError: 在庫不足、もしくは他の整合性問題
 *
 * 返り値:
 * - 更新後の Order（items とその product を含む）
 */
export const updateOrderItemQuantity = async (
  userId: number,
  orderId: number,
  itemId: number,
  newQty: number
) => {
  // 1) 入力チェック（ここで早期 return/throw するとトランザクションを張らずに済む）
  if (!Number.isInteger(newQty) || newQty <= 0) {
    throw new BadRequestError('quantityは1以上の整数で指定してください。');
  }

  // 2) 以降は DB 整合性を保つためトランザクションで実施
  return prisma.$transaction(async (tx) => {
    // 2-1) 注文の所有確認 + 対象アイテムの存在確認
    //      - userId と orderId をキーに注文を取得し、items を読み込みます
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError('注文が見つかりません。');

    const item = order.items.find((it) => it.id === itemId);
    if (!item) throw new NotFoundError('注文アイテムが見つかりません。');

    // 2-2) 対象商品の取得（在庫と現在価格の参照）
    //      - 単価は受注時の unitPrice を使うため、product.price は在庫確認以外には使用しません
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new NotFoundError('商品が見つかりません。');

    // 2-3) 在庫調整量（差分）を算出
    const delta = newQty - item.quantity;

    // 2-4) 差分に応じて在庫を調整
    if (delta > 0) {
      // 数量を増やす → その分の在庫が必要
      if (product.stock < delta) throw new ConflictError('在庫が不足しています。');
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: delta } },
      });
    } else if (delta < 0) {
      // 数量を減らす → 余った分を在庫に戻す
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { increment: -delta } }, // delta は負なので -delta で正に
      });
    }
    // delta === 0 の場合は在庫調整なし（単なる再計算/冪等更新として扱う）

    // 2-5) 単価は受注スナップショット（item.unitPrice）を維持し、lineTotal を再計算
    const unitPrice = item.unitPrice;
    const lineTotal = unitPrice * newQty;

    // 2-6) 該当の OrderItem を更新（数量と lineTotal のみ）
    await tx.orderItem.update({
      where: { id: item.id },
      data: { quantity: newQty, lineTotal },
    });

    // 2-7) 注文全体の合計を、すべての OrderItem の lineTotal 合計で再計算
    const sum = await tx.orderItem.aggregate({
      where: { orderId },
      _sum: { lineTotal: true },
    });

    // 2-8) Order.total を更新し、items(+product) を含めて返却
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { total: sum._sum.lineTotal ?? 0 },
      include: { items: { include: { product: true } } },
    });

    return updated;
  });
};

/**
 * 削除（自分の注文のみ）
 * - 在庫を戻してから注文を削除（OrderItem は onDelete: Cascade を前提）
 */
export const deleteMyOrder = async (userId: number, orderId: number) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError('注文が見つかりません。');

    // 在庫を戻す
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
