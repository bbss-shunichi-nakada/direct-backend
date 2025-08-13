import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { validateParams, validateBody } from '../../middlewares/validate';
import { itemParams, itemUpdateBody } from '../../schemas/orders';
import { ok } from '../../utils/response';
import { updateOrderItemQuantity } from '../../services/orders.service';

const router = Router();

// PUT /api/orders/:orderId/items/:itemId  { quantity }
router.put(
  '/:orderId/items/:itemId',
  validateParams(itemParams),
  validateBody(itemUpdateBody),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { orderId, itemId } = req.params as any;
      const { quantity } = req.body;
      const updated = await updateOrderItemQuantity(req.user!.id, orderId, itemId, quantity);
      return ok(res, updated);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
