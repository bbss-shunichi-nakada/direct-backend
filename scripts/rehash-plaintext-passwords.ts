import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/utils/hash';

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, password: true } });
  let updated = 0;
  for (const u of users) {
    if (!u.password.startsWith('$2')) {
      const hpw = await hashPassword(u.password);
      await prisma.user.update({ where: { id: u.id }, data: { password: hpw } });
      updated++;
    }
  }
  console.log(`Updated ${updated} users`);
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
