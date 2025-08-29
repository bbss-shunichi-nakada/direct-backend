import { z } from 'zod';

// 一覧
export const ordersListQuery = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  q: z.string().trim().optional().default(''),
  sort: z.enum(['newest', 'total_asc', 'total_desc']).default('newest'),
});

// 共通
export const orderIdParams = z.object({
  id: z.coerce.number().int().positive(),
});

// 1商品での作成（後方互換API）
export const orderCreateBody = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

// 1アイテム注文の数量更新（互換API）
export const orderUpdateBody = z.object({
  quantity: z.coerce.number().int().positive(),
});

// PATCH（現状は数量のみ許容）
export const orderPatchBody = z.object({
  quantity: z.coerce.number().int().positive().optional(),
});

// アイテム単位更新用
export const orderItemParams = z.object({
  orderId: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
});
export const orderItemUpdateBody = z.object({
  quantity: z.coerce.number().int().positive(),
});
