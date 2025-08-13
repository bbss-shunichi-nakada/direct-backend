import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { validateBody, validateParams } from '../../middlewares/validate';
import { patchBody, idParams } from '../../schemas/orders';
import { ok } from '../../utils/response';
import { updateOrderQuantity } from '../../services/orders.service';
import { BadRequestError } from '../../utils/errors';

const router = Router();

// PATCH /api/orders/:id  { quantity? }（数量のみ対応）
router.patch(
  '/:id',
  validateParams(idParams),
  validateBody(patchBody),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params as any;
      const { quantity } = req.body;
      if (quantity === undefined) throw new BadRequestError('quantityが必要です。');
      const updated = await updateOrderQuantity(req.user!.id, id, quantity);
      return ok(res, updated);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
