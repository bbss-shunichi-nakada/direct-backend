import type { Response } from 'express';

export const ok = <T>(res: Response, data: T) => res.json({ success: true, data });

export const created = <T>(res: Response, data: T) => res.status(201).json({ success: true, data });

export const paged = <T>(res: Response, items: T[], total: number, limit: number, offset: number) =>
  res.json({ success: true, data: { items, total, limit, offset } });
