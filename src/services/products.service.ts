import prisma from '../lib/prisma'
import { Prisma } from '@prisma/client'

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'

export const listProducts = async (
  limit: number,
  offset: number,
  q = '',
  sort: ProductSort = 'newest'
) => {
  const where: Prisma.ProductWhereInput = q
    ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] }
    : {}

  // ✅ こちらも型注釈 or as const でリテラル固定
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_asc'  ? { price: 'asc'  as const } :
    sort === 'price_desc' ? { price: 'desc' as const } :
    sort === 'name_asc'   ? { name: 'asc'   as const } :
    sort === 'name_desc'  ? { name: 'desc'  as const } :
                            { createdAt: 'desc' as const }

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: offset, take: limit }),
    prisma.product.count({ where }),
  ])
  return { items, total }
}
