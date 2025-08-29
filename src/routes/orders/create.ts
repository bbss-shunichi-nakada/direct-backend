import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateBody } from '../../middlewares/validate';
import { created } from '../../utils/response';
import { orderCreateBody } from '../../schemas/orders';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { createOrder } from '../../services/orders.service';

const router = Router();

// POST /api/orders
router.post(
  '/',
  validateBody(orderCreateBody),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { productId, quantity } = req.body;
    const order = await createOrder(req.user!.id, productId, quantity);
    return created(res, order);
  })
);

export default router;
