import { z } from 'zod';

export const userIdParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const userUpdateBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const userPatchBody = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

/** /users/login 用 */
export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** /users/signup 用（フロントのzodに寄せた最小形。未対応カラムは無視してOK） */
export const signupBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional().default(''),
  kana: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  prefecture: z.string().optional().default(''),
  address1: z.string().optional().default(''),
  address2: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  newsletter: z.boolean().optional().default(false),
});
