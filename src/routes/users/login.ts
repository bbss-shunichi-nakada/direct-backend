import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateBody } from '../../middlewares/validate';
import { loginBody } from '../../schemas/users';
import { ok } from '../../utils/response';
import { authenticateUser } from '../../services/users.service';
import { loginLimiter } from '../../middlewares/rateLimit';
import { generateToken } from '../../utils/jwt';

const router = Router();

// POST /api/users/login
router.post(
  '/login',
  loginLimiter,
  validateBody(loginBody),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    const payload = { userId: user.id, email: user.email };
    const token = generateToken(payload);

    return ok(res, { token, user });
  })
);

export default router;
