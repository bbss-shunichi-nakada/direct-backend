import { Router } from 'express'
import prisma from '../../lib/prisma'
import { authenticate, type AuthenticatedRequest } from '../../middlewares/auth'

const router = Router()

// GET /api/users/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true },
    })
    if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません。' })
    return res.json(user)
  } catch (e) {
    console.error('ユーザー取得エラー:', e)
    return res.status(500).json({ error: 'ユーザー情報の取得に失敗しました。' })
  }
})

export default router
