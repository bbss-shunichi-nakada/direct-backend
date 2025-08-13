import { z } from 'zod';

export const listQuery = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const idParams = z.object({ id: z.coerce.number().int().positive() });

export const createBody = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

export const updateBody = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const patchBody = z.object({
  quantity: z.coerce.number().int().positive().optional(),
});
