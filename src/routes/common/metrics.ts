import { Router } from 'express';
import { metricsHandler } from '../../middlewares/metrics';

const router = Router();

// GET /metrics
router.get('/metrics', metricsHandler);

export default router;
