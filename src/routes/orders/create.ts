import { Router } from 'express'
import prisma from '../../lib/prisma'
import type { AuthenticatedRequest } from '../../middlewares/auth'
import { asyncHandler } from '../../middlewares/async'
import { BadRequestError, NotFoundError } from '../../utils/errors'

const router = Router()

router.post('/create', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { productId, quantity } = req.body as { productId?: number; quantity?: number }
  const pid = Number(productId)
  const qty = Number(quantity)
  if (!Number.isInteger(pid) || pid <= 0) throw new BadRequestError('productIdの形式が不正です。')
  if (!Number.isInteger(qty) || qty <= 0) throw new BadRequestError('quantityは1以上の整数で指定してください。')

  const product = await prisma.product.findUnique({ where: { id: pid } })
  if (!product) throw new NotFoundError('商品が見つかりません。')

  const order = await prisma.order.create({
    data: { userId: req.user!.id, productId: pid, quantity: qty, total: product.price * qty },
    include: { product: true },
  })
  return res.status(201).json(order)
}))

export default router
