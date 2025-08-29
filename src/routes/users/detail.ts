import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams } from '../../middlewares/validate';
import { userIdParams } from '../../schemas/users';
import { ok } from '../../utils/response';
import { getUserById } from '../../services/users.service';
import { NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/users/:id
router.get(
  '/:id',
  validateParams(userIdParams),
  asyncHandler(async (req, res) => {
    const { id } = req.params as any;
    const user = await getUserById(id);
    if (!user) throw new NotFoundError('ユーザーが見つかりません。');
    return ok(res, user);
  })
);

export default router;
