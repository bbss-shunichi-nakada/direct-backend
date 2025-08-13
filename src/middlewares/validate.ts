import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '../utils/errors';

type Part = 'body' | 'query' | 'params';

const apply =
  (part: Part) =>
  (schema: ZodSchema<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as any)[part]);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(', ');
      return next(new BadRequestError(msg || `Invalid ${part}`));
    }
    // パース結果で置き換え（型安全＆整形された値を下流へ）
    (req as any)[part] = result.data;
    next();
  };

export const validateBody = apply('body');
export const validateQuery = apply('query');
export const validateParams = apply('params');
