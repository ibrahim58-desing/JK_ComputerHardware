import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { ProductBanner } from '@/components/product-banner'
import { ProductsExplorer } from '@/components/products-explorer'
import { CtaBanner } from '@/components/cta-banner'

import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Products — JK Infosystem',
  description:
    'Browse our full range of genuine computer hardware — CPUs, GPUs, RAM, storage, monitors, keyboards and mice at honest, competitive prices.',
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { 
        status: 'active',
        image: { not: '/placeholder.jpg' },
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
  ])

  // Format products to match the expected frontend Product type
  const formattedProducts = products.map(p => ({
    ...p,
    category: p.category?.name || 'Hardware',
    badge: p.badge ? (typeof p.badge === 'string' ? JSON.parse(p.badge) : p.badge) : undefined,
  }))

  return (
    <>
      <PageHero
        title="Our Products"
        subtitle="Browse our full range of genuine computer hardware"
        variant="white"
      />
      <ProductBanner />
      <ProductsExplorer initialProducts={formattedProducts as any} />
      <CtaBanner />
    </>
  )
}
