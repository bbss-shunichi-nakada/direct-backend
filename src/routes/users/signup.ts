import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateBody } from '../../middlewares/validate';
import { signupBody } from '../../schemas/users';
import { created } from '../../utils/response';
import { createUser } from '../../services/users.service';

const router = Router();

// POST /api/users/signup
router.post(
  '/signup',
  validateBody(signupBody),
  asyncHandler(async (req, res) => {
    // サービス層で重複メール・ハッシュ化・最小保存を実施
    const user = await createUser(req.body);
    return created(res, user);
  })
);

export default router;
