import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams } from '../../middlewares/validate';
import { ok } from '../../utils/response';
import { orderIdParams } from '../../schemas/orders';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { getMyOrder } from '../../services/orders.service';
import { NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/orders/:id
router.get(
  '/:id',
  validateParams(orderIdParams),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params as any;
    const order = await getMyOrder(req.user!.id, id);
    if (!order) throw new NotFoundError('注文が見つかりません。');
    return ok(res, order);
  })
);

export default router;
