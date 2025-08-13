import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

export interface RequestWithLog extends Request {
  id?: string;
  log?: ReturnType<typeof logger.child>;
}

export const requestId = (req: RequestWithLog, res: Response, next: NextFunction) => {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  req.log = logger.child({ requestId: id, method: req.method, path: req.path });
  next();
};
