import { Router } from 'express';
import listRouter from './list';
import detailRouter from './detail';
import updateRouter from './update';
import patchRouter from './patch';
import removeRouter from './remove';

const router = Router();

router.use(listRouter);
router.use(detailRouter);
router.use(updateRouter);
router.use(patchRouter);
router.use(removeRouter);

export default router;
