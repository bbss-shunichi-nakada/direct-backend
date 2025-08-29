import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams, validateBody } from '../../middlewares/validate';
import { userIdParams, userPatchBody } from '../../schemas/users';
import { ok } from '../../utils/response';
import { patchUser } from '../../services/users.service';

const router = Router();

// PATCH /api/users/:id
router.patch(
  '/:id',
  validateParams(userIdParams),
  validateBody(userPatchBody),
  asyncHandler(async (req, res) => {
    const { id } = req.params as any;
    const updated = await patchUser(id, req.body);
    return ok(res, updated);
  })
);

export default router;
