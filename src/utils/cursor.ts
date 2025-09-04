export const encodeCursor = (id: number): string =>
  Buffer.from(String(id), 'utf8').toString('base64');

export const decodeCursor = (cursor: string): number | undefined => {
  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf8');
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
};
