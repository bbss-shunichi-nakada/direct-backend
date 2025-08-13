import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../../middlewares/auth';
import { ok } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';
import { getMe } from '../../services/users.service';

const router = Router();

router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const me = await getMe(req.user!.id);
    if (!me) throw new NotFoundError('ユーザーが見つかりません。');
    return ok(res, me);
  } catch (e) {
    next(e);
  }
});

export default router;
