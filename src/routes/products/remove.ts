import { Router } from 'express'
import prisma from '../../lib/prisma'
import { asyncHandler } from '../../middlewares/async'
import { BadRequestError, NotFoundError } from '../../utils/errors'

const router = Router()

// DELETE /api/products/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。')

  await prisma.product.delete({ where: { id } })
  return res.status(204).end()
}))

export default router
