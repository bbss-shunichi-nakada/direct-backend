import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams, validateBody } from '../../middlewares/validate';
import { ok } from '../../utils/response';
import { productIdParams, productUpdateBody } from '../../schemas/products';
import { updateProduct } from '../../services/products.service';

const router = Router();

// PUT /api/products/:id
router.put(
  '/:id',
  validateParams(productIdParams),
  validateBody(productUpdateBody),
  asyncHandler(async (req, res) => {
    const { id } = req.params as any;
    const updated = await updateProduct(id, req.body);
    return ok(res, updated);
  })
);

export default router;
