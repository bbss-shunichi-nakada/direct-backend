import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpDuration);

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const dur = Number(process.hrtime.bigint() - start) / 1e9;
    const route = (req.baseUrl || '') + (req.route?.path || req.path || '');
    httpDuration
      .labels(req.method, route || 'unknown', String(res.statusCode))
      .observe(dur);
  });
  next();
};

export const metricsHandler = async (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
