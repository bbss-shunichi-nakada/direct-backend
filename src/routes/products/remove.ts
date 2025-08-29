import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { validateParams } from '../../middlewares/validate';
import { productIdParams } from '../../schemas/products';
import { removeProduct } from '../../services/products.service';

const router = Router();

// DELETE /api/products/:id
router.delete(
  '/:id',
  validateParams(productIdParams),
  asyncHandler(async (req, res) => {
    const { id } = req.params as any;
    await removeProduct(id);
    return res.status(204).end();
  })
);

export default router;
