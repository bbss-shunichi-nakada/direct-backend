import type { Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../config/logger';
import { AppError } from '../utils/errors';
import type { RequestWithLog } from './requestId';

export const notFoundHandler = (_req: RequestWithLog, _res: Response, next: NextFunction) => {
  next(new AppError('Not Found', 404));
};

export const errorHandler = (
  err: unknown,
  req: RequestWithLog,
  res: Response,
  _next: NextFunction
) => {
  const log = req?.log || logger;

  let status = 500;
  let message = 'Internal Server Error';
  let code: string | undefined;

  if (err instanceof AppError) {
    status = err.status;
    message = err.message;
    code = err.code;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      status = 409;
      message = '一意制約に違反しています。';
      code = 'P2002';
    } else {
      code = err.code;
    }
  } else if (err instanceof SyntaxError) {
    status = 400;
    message = '不正なJSONです。';
  }

  // ✅ Winston は (message: string, meta?: any) の順序
  log.error('request_failed', { status, message, code, stack: (err as any)?.stack });

  res.status(status).json({ error: message, code, requestId: req?.id });
};
