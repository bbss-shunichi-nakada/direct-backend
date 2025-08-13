import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { validateBody } from '../../middlewares/validate';
import { createBody } from '../../schemas/orders';
import { created } from '../../utils/response';
import { createOrder } from '../../services/orders.service';

const router = Router();

// POST /api/orders  { productId, quantity }  （1注文=1商品の簡易API）
router.post('/', validateBody(createBody), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const order = await createOrder(req.user!.id, productId, quantity);
    return created(res, order);
  } catch (e) {
    next(e);
  }
});

export default router;
