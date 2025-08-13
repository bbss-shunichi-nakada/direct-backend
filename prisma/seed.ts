import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function resetAllTables() {
  // 外部キーを一時的に無効化（TRUNCATE のため）
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');

  // 順序はどれでもOK（FK無効化中）が、念のため子→親の順
  const tables = ['OrderItem', 'Order', 'Product', 'User'];
  for (const t of tables) {
    // 予約語や大文字小文字の差異に備えてバッククォートで囲む
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${t}\``);
  }

  // 外部キーを再有効化
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
}

async function main() {
  // ✅ これでデータ＋AUTO_INCREMENTが完全リセットされます
  await resetAllTables();

  // 以降は投入（例）
  const [alice, bob] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        password: await bcrypt.hash('P@ssw0rd', SALT_ROUNDS),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob',
        email: 'bob@example.com',
        password: await bcrypt.hash('P@ssw0rd', SALT_ROUNDS),
      },
    }),
  ]);

  await prisma.product.createMany({
    data: [
      { name: 'Widget A', description: 'Basic widget', price: 1200, stock: 100 },
      { name: 'Widget B', description: 'Pro widget', price: 2400, stock: 80 },
      { name: 'Gadget C', description: 'Cool gadget', price: 3600, stock: 50 },
    ],
  });

  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
  const [pA, pB, pC] = products;

  // 注文作成（Order + OrderItem[]、totalはサーバで計算）
  // 例: Alice が Widget A を2個、Widget B を1個
  const aliceOrder = await prisma.$transaction(async (tx) => {
    const items = [
      { productId: pA.id, quantity: 2, unitPrice: pA.price, lineTotal: pA.price * 2 },
      { productId: pB.id, quantity: 1, unitPrice: pB.price, lineTotal: pB.price * 1 },
    ];
    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

    // 在庫引当
    await tx.product.update({ where: { id: pA.id }, data: { stock: { decrement: 2 } } });
    await tx.product.update({ where: { id: pB.id }, data: { stock: { decrement: 1 } } });

    // 注文 + 注文アイテム
    return tx.order.create({
      data: {
        userId: alice.id,
        total,
        items: { create: items },
      },
      include: { items: true },
    });
  });

  // 例: Bob が Gadget C を3個
  const bobOrder = await prisma.$transaction(async (tx) => {
    const items = [{ productId: pC.id, quantity: 3, unitPrice: pC.price, lineTotal: pC.price * 3 }];
    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

    await tx.product.update({ where: { id: pC.id }, data: { stock: { decrement: 3 } } });

    return tx.order.create({
      data: {
        userId: bob.id,
        total,
        items: { create: items },
      },
      include: { items: true },
    });
  });

  console.log('Seeded users:', { alice: alice.email, bob: bob.email });
  console.log('Seeded products:', products.map((p) => `${p.name} (¥${p.price})`).join(', '));
  console.log('Created orders:', { aliceOrderId: aliceOrder.id, bobOrderId: bobOrder.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
