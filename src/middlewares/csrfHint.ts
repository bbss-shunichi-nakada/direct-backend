import type { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    csrfToken?: string;
  }
}

/** X-CSRF-Token を受け取って保持するだけ（現時点は検証しない） */
export const csrfHint = (req: Request, _res: Response, next: NextFunction) => {
  // 読み取り系は素通り
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  const token = (req.headers['x-csrf-token'] as string) || undefined;
  if (token) (req as any).csrfToken = token;
  next();
};
