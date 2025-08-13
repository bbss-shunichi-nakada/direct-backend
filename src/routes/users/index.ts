import { Router } from 'express';
import loginRouter from './login';
import signupRouter from './signup';
import meRouter from './me';
import detailRouter from './detail';
import updateRouter from './update';
import patchRouter from './patch';
import removeRouter from './remove';

const router = Router();

router.use(loginRouter); // /api/users/login
router.use(signupRouter); // /api/users/signup
router.use(meRouter); // /api/users/me
router.use(detailRouter);
router.use(updateRouter);
router.use(patchRouter);
router.use(removeRouter);

export default router;
