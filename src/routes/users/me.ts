import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async';
import type { AuthenticatedRequest } from '../../middlewares/auth';
import { ok } from '../../utils/response';
import { getUserById } from '../../services/users.service';
import { NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/users/me
router.get(
  '/me',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = req.user!.id; // 型は { id:number } として扱う
    const user = await getUserById(id); // 公開フィールドだけを返すサービス
    if (!user) throw new NotFoundError('ユーザーが見つかりません。');
    return ok(res, user);
  })
);

export default router;
