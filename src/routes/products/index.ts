import { Router } from 'express';
import listRouter from './list';
import detailRouter from './detail';

const router = Router();

// GET /api/products
router.use(listRouter);
// GET /api/products/:id
router.use(detailRouter);

export default router;
