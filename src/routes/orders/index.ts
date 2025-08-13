import { Router } from 'express'
import { authenticate } from '../../middlewares/auth'
import listRouter from './list'
import createRouter from './create'

const router = Router()

// すべての /api/orders 配下は認証必須
router.use(authenticate)

// GET /api/orders （自分の注文のみ）
router.use(listRouter)

// POST /api/orders
router.use(createRouter)

export default router
