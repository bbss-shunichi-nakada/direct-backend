import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams, validateBody } from '../../middlewares/validate';
import { ok } from '../../utils/response';
import { productIdParams, productPatchBody } from '../../schemas/products';
import { patchProduct } from '../../services/products.service';

const router = Router();

// PATCH /api/products/:id
router.patch(
  '/:id',
  validateParams(productIdParams),
  validateBody(productPatchBody),
  asyncHandler(async (req, res) => {
    const { id } = req.params as any;
    const updated = await patchProduct(id, req.body);
    return ok(res, updated);
  })
);

export default router;
