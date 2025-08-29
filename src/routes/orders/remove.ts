import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams } from '../../middlewares/validate';
import { orderIdParams } from '../../schemas/orders';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { deleteMyOrder } from '../../services/orders.service';

const router = Router();

// DELETE /api/orders/:id
router.delete(
  '/:id',
  validateParams(orderIdParams),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as any;
    await deleteMyOrder(req.user!.id, id);
    return res.status(204).end();
  })
);

export default router;
