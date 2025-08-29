import { z } from 'zod';

// 一覧
export const productsListQuery = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  q: z.string().trim().optional().default(''),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']).default('newest'),
});

// 共通
export const productIdParams = z.object({
  id: z.coerce.number().int().positive(),
});

// 更新（PUT）
export const productUpdateBody = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative().default(0),
});

// 部分更新（PATCH）
export const productPatchBody = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
});
