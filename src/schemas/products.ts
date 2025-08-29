import { z } from 'zod';

export const productsListQuery = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  q: z.string().trim().optional().default(''),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']).default('newest'),
});
