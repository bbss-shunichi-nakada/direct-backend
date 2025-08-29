import { Router } from 'express';
import { idempotency } from '../../middlewares/idempotency';
import listRouter from './list';
import detailRouter from './detail';
import updateRouter from './update';
import patchRouter from './patch';
import removeRouter from './remove';

const router = Router();

// ★ ここで orders 配下の POST/PUT/PATCH/DELETE 全部に適用される（GETは素通り）
router.use(idempotency);

router.use(listRouter);
router.use(detailRouter);
router.use(updateRouter);
router.use(patchRouter);
router.use(removeRouter);

export default router;
