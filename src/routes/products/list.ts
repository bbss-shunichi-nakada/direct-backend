// src/routes/products/list.ts
import { Router } from 'express';
import { validateQuery } from '../../middlewares/validate';
import { productsListQuery } from '../../schemas/products';
import { paged } from '../../utils/response';
import { asyncHandler } from '../../middlewares/async';
import { listProducts } from '../../services/products.service';

const router = Router();

// GET /api/products?limit=&offset=&q=&sort=
router.get(
  '/',
  validateQuery(productsListQuery),
  asyncHandler(async (req, res) => {
    const { limit, offset, q, sort } = req.query as any;
    const { items, total } = await listProducts(limit, offset, q, sort);
    return paged(res, items, total, limit, offset, { q, sort });
  })
);

export default router;
