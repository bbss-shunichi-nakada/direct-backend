import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams, validateBody } from '../../middlewares/validate';
import { ok } from '../../utils/response';
import { orderItemParams, orderItemUpdateBody } from '../../schemas/orders';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { updateOrderItemQuantity } from '../../services/orders.service';

const router = Router();

// PUT /api/orders/:orderId/items/:itemId
router.put(
  '/:orderId/items/:itemId',
  validateParams(orderItemParams),
  validateBody(orderItemUpdateBody),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { orderId, itemId } = req.params as any;
    const { quantity } = req.body;
    const updated = await updateOrderItemQuantity(req.user!.id, orderId, itemId, quantity);
    return ok(res, updated);
  })
);

export default router;
