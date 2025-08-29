import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import { requireAdmin } from '../../middlewares/rbac';
import { ok } from '../../utils/response';

const router = Router();
router.use(asyncHandler(requireAdmin));

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    // ここに管理者向け処理
    return ok(res, { ok: true });
  })
);

export default router;
