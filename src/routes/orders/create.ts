import { Router } from 'express'
import prisma from '../../lib/prisma'
import type { AuthenticatedRequest } from '../../middlewares/auth'

const router = Router()

/**
 * POST /api/orders
 * body: { productId: number, quantity: number }
 * - userId はトークンから取得
 * - 合計(total)はサーバーで price * quantity を再計算
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  const { productId, quantity } = req.body as { productId?: number; quantity?: number }

  const pid = Number(productId)
  const qty = Number(quantity)
  if (!Number.isInteger(pid) || pid <= 0) {
    return res.status(400).json({ error: 'productIdの形式が不正です。' })
  }
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: 'quantityは1以上の整数で指定してください。' })
  }

  try {
    // 商品取得（価格チェック用）
    const product = await prisma.product.findUnique({ where: { id: pid } })
    if (!product) return res.status(404).json({ error: '商品が見つかりません。' })

    const total = product.price * qty
    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        productId: pid,
        quantity: qty,
        total,
      },
      include: { product: true },
    })

    return res.status(201).json(order)
  } catch (e) {
    console.error('注文作成エラー:', e)
    return res.status(500).json({ error: '注文の作成に失敗しました。' })
  }
})

export default router
