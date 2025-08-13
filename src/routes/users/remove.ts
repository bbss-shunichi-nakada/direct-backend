import { Router } from 'express'
import prisma from '../../lib/prisma'
import { authenticate, type AuthenticatedRequest } from '../../middlewares/auth'
import { asyncHandler } from '../../middlewares/async'
import { BadRequestError, ForbiddenError, ConflictError } from '../../utils/errors'

const router = Router()

// DELETE /api/users/:id  （本人のみ）
// 注：注文（Order）が存在する場合は 409 を返す（外部キー制約対策）
router.delete('/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new BadRequestError('idの形式が不正です。')
  if (req.user!.id !== id) throw new ForbiddenError('権限がありません。')

  const orderCount = await prisma.order.count({ where: { userId: id } })
  if (orderCount > 0) {
    throw new ConflictError('注文履歴があるためアカウントを削除できません。')
  }

  await prisma.user.delete({ where: { id } })
  return res.status(204).end()
}))

export default router
