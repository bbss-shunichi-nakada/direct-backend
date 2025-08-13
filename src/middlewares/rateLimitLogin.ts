import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 60_000, // 1分
  max: 5, // 1分に5回
  standardHeaders: true,
  legacyHeaders: false,
});
