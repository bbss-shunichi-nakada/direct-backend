import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { validateBody, validateParams } from '../../middlewares/validate';
import { updateBody, idParams } from '../../schemas/orders';
import { ok } from '../../utils/response';
import { updateOrderQuantity } from '../../services/orders.service';

const router = Router();

// PUT /api/orders/:id  { quantity }
router.put(
  '/:id',
  validateParams(idParams),
  validateBody(updateBody),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params as any;
      const { quantity } = req.body;
      const updated = await updateOrderQuantity(req.user!.id, id, quantity);
      return ok(res, updated);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
