// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env'; // ← env.ts 側で .env を読むようにします
import logger from './config/logger';
import { requestId } from './middlewares/requestId';
import { apiLimiter } from './middlewares/rateLimit';
import { notFoundHandler, errorHandler } from './middlewares/error';
import usersRouter from './routes/users';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';

const app = express();

app.use(helmet());
app.use(requestId);
app.use(express.json({ limit: '1mb' }));

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN ?? true,
    credentials: true,
  })
);

app.use('/api', apiLimiter);

app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// ✅ Winston は (message, meta)
const server = app.listen(env.PORT, () => {
  logger.info('server_started', { port: env.PORT, env: env.NODE_ENV });
});

// 健康チェック
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.get('/readyz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('ready');
  } catch {
    res.status(500).send('not-ready');
  }
});

// Graceful shutdown
import prisma from './lib/prisma';
const shutdown = async (signal: string) => {
  logger.info('shutdown_signal', { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
