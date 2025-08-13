import { z } from 'zod';

export const loginBody = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'passwordは必須です'),
});

export const signupBody = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(6, '6文字以上で入力してください'),
  name: z.string().optional().default(''),
  // 受け取るが現状は未保存（将来UserProfileへ）
  kana: z.string().optional().default(''),
  postalCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/, '郵便番号を正しく入力してください')
    .optional()
    .default(''),
  prefecture: z.string().optional().default(''),
  address1: z.string().optional().default(''),
  address2: z.string().optional().default(''),
  phone: z
    .string()
    .regex(/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/, '電話番号を正しく入力してください')
    .optional()
    .default(''),
  newsletter: z.boolean().optional().default(false),
});

export const meParams = z.object({});
export const userIdParams = z.object({ id: z.coerce.number().int().positive() });
export const userUpdateBody = z.object({ name: z.string() });
export const userPatchBody = z.object({ name: z.string().optional() });
