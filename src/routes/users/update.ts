import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams, validateBody } from '../../middlewares/validate';
import { userIdParams, userUpdateBody } from '../../schemas/users';
import { ok } from '../../utils/response';
import { updateUser } from '../../services/users.service';

const router = Router();

// PUT /api/users/:id
router.put(
  '/:id',
  validateParams(userIdParams),
  validateBody(userUpdateBody),
  asyncHandler(async (req, res) => {
    const { id } = req.params as any;
    const updated = await updateUser(id, req.body);
    return ok(res, updated);
  })
);

export default router;
