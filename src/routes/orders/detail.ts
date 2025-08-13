import { Router } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { getMyOrder } from '../../services/orders.service';

const router = Router();

router.get(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');
    const order = await getMyOrder(req.user!.id, id);
    if (!order) throw new NotFoundError('注文が見つかりません。');
    return res.json(order);
  })
);

export default router;
