import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams, validateBody } from '../../middlewares/validate';
import { ok } from '../../utils/response';
import { orderIdParams, orderUpdateBody } from '../../schemas/orders';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { updateOrderQuantity } from '../../services/orders.service';

const router = Router();

// PUT /api/orders/:id
router.put(
  '/:id',
  validateParams(orderIdParams),
  validateBody(orderUpdateBody),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as any;
    const { quantity } = req.body;
    const updated = await updateOrderQuantity(req.user!.id, id, quantity);
    return ok(res, updated);
  })
);

export default router;
