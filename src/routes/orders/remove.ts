import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError } from '../../utils/errors';
import { deleteMyOrder } from '../../services/orders.service';

const router = Router();

// DELETE /api/orders/:id
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');

    await deleteMyOrder(req.user!.id, id);
    return res.status(204).end();
  })
);

export default router;
