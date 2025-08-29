import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams } from '../../middlewares/validate';
import { userIdParams } from '../../schemas/users';
import { removeUser } from '../../services/users.service';

const router = Router();

// DELETE /api/users/:id
router.delete(
  '/:id',
  validateParams(userIdParams),
  asyncHandler(async (req, res) => {
    const { id } = req.params as any;
    await removeUser(id);
    return res.status(204).end();
  })
);

export default router;
