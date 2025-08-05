import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      name: '山田 太郎',
      email: 'test@example.com',
      password: 'Password123!',
    },
  });

  // 商品作成
  const product1 = await prisma.product.create({
    data: {
      name: '商品A',
      description: 'これは商品Aの説明です。',
      price: 3000,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: '商品B',
      description: 'これは商品Bの説明です。',
      price: 2000,
    },
  });

  // 注文作成
  await prisma.order.create({
    data: {
      userId: user.id,
      productId: product1.id,
      quantity: 1,
      total: product1.price,
    },
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      productId: product2.id,
      quantity: 2,
      total: product2.price * 2,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
