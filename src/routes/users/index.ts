import { Router } from 'express';
import loginRouter from './login';
import signupRouter from './signup';
import meRouter from './me';

const router = Router();

router.use(loginRouter); // /api/users/login
router.use(signupRouter); // /api/users/signup
router.use(meRouter); // /api/users/me

export default router;
