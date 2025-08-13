import { Router } from 'express';
import prisma from '../../lib/prisma';
import { asyncHandler } from '../../middlewares/async';
import { BadRequestError, NotFoundError } from '../../utils/errors';

const router = Router();

// PATCH /api/products/:id
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。');

    const { name, description, price } = req.body as {
      name?: string;
      description?: string;
      price?: number;
    };

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
      },
    });

    return res.json(product);
  })
);

export default router;
