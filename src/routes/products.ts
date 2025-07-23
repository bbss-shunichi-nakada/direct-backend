import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

router.post('/', async (req, res) => {
  const { name, price } = req.body;
  const product = await prisma.product.create({
    data: { name, price: Number(price) },
  });
  res.status(201).json(product);
});

export default router;
