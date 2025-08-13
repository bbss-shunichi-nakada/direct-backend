import { Router } from 'express';
import { validateBody } from '../../middlewares/validate';
import { signupBody } from '../../schemas/users';
import { created } from '../../utils/response';
import prisma from '../../lib/prisma';
import { ConflictError } from '../../utils/errors';
import { createUser } from '../../services/users.service';

const router = Router();

router.post('/signup', validateBody(signupBody), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictError('このemailは既に登録されています。');
    const user = await createUser(email, password, name);
    return created(res, user);
  } catch (e) {
    next(e);
  }
});

export default router;
