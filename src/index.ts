import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import logger from './config/logger';
import corsConfigured from './middlewares/cors';
import { requestId } from './middlewares/requestId';
import { metricsMiddleware } from './middlewares/metrics';
import metricsRouter from './routes/common/metrics';
import { generalLimiter } from './middlewares/rateLimit';
import { notFoundHandler, errorHandler } from './middlewares/error';
import usersRouter from './routes/users';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';
import { csrfHint } from './middlewares/csrfHint';
import prisma from './lib/prisma'; // ← 上に移動（可読性）

const app = express();

// ---- 共通ミドルウェア ----
app.use(helmet());
app.use(corsConfigured);
app.options('*', corsConfigured);
app.use(cookieParser());
app.use(csrfHint);
app.use(requestId);
app.use(metricsMiddleware);
app.use('/', metricsRouter);
app.use(express.json({ limit: '1mb' }));

// ---- ヘルスチェック（404/エラーハンドラより前に！）----
app.get(['/healthz', '/api/healthz', '/api/v1/healthz'], (_req, res) => {
  res.status(200).send('ok');
});

app.get(['/readyz', '/api/readyz', '/api/v1/readyz'], async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('ready');
  } catch {
    res.status(500).send('not-ready');
  }
});

// ---- ルータ ----
app.use('/api', generalLimiter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

// v1 エイリアス（将来の互換確保）
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);

// ---- 404 & エラーハンドラ（最後）----
app.use(notFoundHandler);
app.use(errorHandler);

// ---- 起動 ----
const host = '0.0.0.0'; // 外部からも叩くなら 0.0.0.0 推奨
const server = app.listen(env.PORT, host, () => {
  logger.info(`[${env.NODE_ENV}] API listening on http://${host}:${env.PORT}`);
});

// ---- Graceful shutdown ----
const shutdown = async (signal: string) => {
  logger.info('shutdown_signal', { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
