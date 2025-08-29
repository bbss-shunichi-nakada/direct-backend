import { Router } from 'express';
import { validateQuery } from '../../middlewares/validate';
import { ordersListQuery } from '../../schemas/orders';
import { paged } from '../../utils/response';
import { asyncHandler } from '../../middlewares/async';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { listMyOrders } from '../../services/orders.service';

// GET /api/orders?limit=&offset=&q=&sort=
const router = Router();

router.get(
  '/',
  validateQuery(ordersListQuery),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { limit, offset, q, sort } = req.query as any;
    const { items, total } = await listMyOrders(req.user!.id, limit, offset, q, sort);
    return paged(res, items, total, limit, offset, { q, sort });
  })
);

export default router;
