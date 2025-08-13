import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import listRouter from './list';
import createRouter from './create';
import detailRouter from './detail';
import updateRouter from './update';
import patchRouter from './patch';
import removeRouter from './remove';
import itemUpdateRouter from './itemUpdate'

const router = Router();

// すべての /api/orders 配下は認証必須
router.use(authenticate);

// GET /api/orders （自分の注文のみ）
router.use(listRouter);

// POST /api/orders
router.use(createRouter);

router.use(detailRouter);
router.use(updateRouter);
router.use(patchRouter);
router.use(removeRouter);
router.use(itemUpdateRouter)

export default router;
