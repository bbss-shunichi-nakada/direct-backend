import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams, validateBody } from '../../middlewares/validate';
import { ok } from '../../utils/response';
import { orderIdParams, orderPatchBody } from '../../schemas/orders';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { updateOrderQuantity } from '../../services/orders.service';
import { BadRequestError } from '../../utils/errors';

const router = Router();

// PATCH /api/orders/:id
router.patch(
  '/:id',
  validateParams(orderIdParams),
  validateBody(orderPatchBody),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as any;
    const { quantity } = req.body;
    if (quantity === undefined) throw new BadRequestError('quantityが必要です。');
    const updated = await updateOrderQuantity(req.user!.id, id, quantity);
    return ok(res, updated);
  })
);

export default router;
