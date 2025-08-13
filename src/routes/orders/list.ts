import { Router } from 'express'
import prisma from '../../lib/prisma'
import type { AuthenticatedRequest } from '../../middlewares/auth'

const router = Router()

// GET /api/orders
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { id: 'desc' },
    })
    return res.json(orders)
  } catch (e) {
    console.error('注文一覧取得エラー:', e)
    return res.status(500).json({ error: '注文一覧の取得に失敗しました。' })
  }
})

export default router
