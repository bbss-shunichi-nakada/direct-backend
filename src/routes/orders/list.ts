import { Router } from 'express';
import { validateQuery } from '../../middlewares/validate';
import { listQuery } from '../../schemas/orders';
import { paged } from '../../utils/response';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { listMyOrders } from '../../services/orders.service';

const router = Router();

router.get('/', validateQuery(listQuery), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { limit, offset } = req.query as any;
    const [items, total] = await listMyOrders(req.user!.id, limit, offset);
    return paged(res, items, total, limit, offset);
  } catch (e) {
    next(e);
  }
});

export default router;
