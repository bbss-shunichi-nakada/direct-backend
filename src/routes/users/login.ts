import { Router } from 'express';
import { validateBody } from '../../middlewares/validate';
import { loginBody } from '../../schemas/users';
import { generateToken } from '../../utils/jwt';
import { UnauthorizedError } from '../../utils/errors';
import { ok } from '../../utils/response';
import { validateLogin } from '../../services/users.service';
import { loginLimiter } from '../../middlewares/rateLimitLogin';

const router = Router();

router.post('/login', loginLimiter, validateBody(loginBody), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await validateLogin(email, password);
    if (!user) throw new UnauthorizedError('メールアドレスまたはパスワードが不正です。');
    const token = generateToken({ userId: user.id });
    return ok(res, { token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    next(e);
  }
});

export default router;
