import { Router } from 'express';
import { idempotency } from '../../middlewares/idempotency';
import loginRouter from './login';
import signupRouter from './signup';
import meRouter from './me';
import detailRouter from './detail';
import updateRouter from './update';
import patchRouter from './patch';
import removeRouter from './remove';

const router = Router();

// ★ ここで orders 配下の POST/PUT/PATCH/DELETE 全部に適用される（GETは素通り）
router.use(idempotency);

router.use(loginRouter); // /api/users/login
router.use(signupRouter); // /api/users/signup
router.use(meRouter); // /api/users/me
router.use(detailRouter);
router.use(updateRouter);
router.use(patchRouter);
router.use(removeRouter);

export default router;
