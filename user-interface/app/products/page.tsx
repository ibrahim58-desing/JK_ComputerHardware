import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { PageHero } from '@/components/page-hero'
import { ProductBanner } from '@/components/product-banner'
import { ProductsExplorer } from '@/components/products-explorer'
import { CtaBanner } from '@/components/cta-banner'

import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Products — JK Infosystem',
  description:
    'Browse our full range of genuine computer hardware — CPUs, GPUs, RAM, storage, monitors, keyboards and mice at honest, competitive prices.',
}

export const revalidate = 60

const PAGE_SIZE = 24

type PriceFilter = 'All' | 'Under ₹10k' | '₹10k - ₹30k' | 'Above ₹30k'

function priceRangeWhere(filter: PriceFilter): Prisma.FloatFilter | undefined {
  if (filter === 'Under ₹10k') return { lt: 10000 }
  if (filter === '₹10k - ₹30k') return { gte: 10000, lte: 30000 }
  if (filter === 'Above ₹30k') return { gt: 30000 }
  return undefined
}

// The category/brand/price-bucket counts scan the entire active catalog and
// are identical for every visitor regardless of which page or filter they're
// on — they don't need to be recomputed on every request. Caching them
// turns 6 of the page's 8 queries into a once-per-5-minutes cost instead of
// a per-request one, which is where most of the page's DB time was going
// once the catalog grew into the thousands.
const getProductFacets = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany()
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

    const [totalActiveCount, categoryGroups, brandGroups, underTenK, tenToThirtyK, aboveThirtyK] =
      await Promise.all([
        prisma.product.count({ where: { status: 'active' } }),
        prisma.product.groupBy({ by: ['categoryId'], where: { status: 'active' }, _count: { _all: true } }),
        prisma.product.groupBy({
          by: ['brand'],
          where: { status: 'active', brand: { not: '' } },
          _count: { _all: true },
        }),
        prisma.product.count({ where: { status: 'active', numericPrice: { lt: 10000 } } }),
        prisma.product.count({ where: { status: 'active', numericPrice: { gte: 10000, lte: 30000 } } }),
        prisma.product.count({ where: { status: 'active', numericPrice: { gt: 30000 } } }),
      ])

    const categoryCounts = categoryGroups
      .map((g) => ({ name: categoryNameById.get(g.categoryId) || 'Unknown', count: g._count._all }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
    const brandCounts = brandGroups
      .map((g) => ({ name: g.brand, count: g._count._all }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      categories,
      categoryCounts,
      brandCounts,
      priceCounts: {
        All: totalActiveCount,
        'Under ₹10k': underTenK,
        '₹10k - ₹30k': tenToThirtyK,
        'Above ₹30k': aboveThirtyK,
      } as Record<PriceFilter, number>,
    }
  },
  ['product-facets'],
  { revalidate: 300 }
)

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; price?: string; page?: string }>
}) {
  const sp = await searchParams
  const [settings, facets] = await Promise.all([getSiteSettings(), getProductFacets()])

  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)
  const activeCategory = sp.category || 'All'
  const activeBrand = sp.brand || 'All'
  const activePrice: PriceFilter = (['All', 'Under ₹10k', '₹10k - ₹30k', 'Above ₹30k'] as const).includes(
    sp.price as PriceFilter
  )
    ? (sp.price as PriceFilter)
    : 'All'

  const categoryIdByName = new Map(facets.categories.map((c) => [c.name, c.id]))

  const where: Prisma.ProductWhereInput = { status: 'active' }
  if (activeCategory !== 'All' && categoryIdByName.has(activeCategory)) {
    where.categoryId = categoryIdByName.get(activeCategory)
  }
  if (activeBrand !== 'All') where.brand = activeBrand
  const priceRange = priceRangeWhere(activePrice)
  if (priceRange) where.numericPrice = priceRange

  const [products, filteredCount] = await Promise.all([
    prisma.product.findMany({
      where,
      // Only the fields the product card actually renders — the full
      // description/spec text isn't needed here and used to bloat every
      // page load once the catalog grew past a couple thousand rows.
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        numericPrice: true,
        stock: true,
        brand: true,
        specs: true,
        badge: true,
        offer: true,
        image: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ])

  // Format products to match the expected frontend Product type
  const formattedProducts = products.map((p) => ({
    ...p,
    category: p.category?.name || 'Hardware',
    badge: p.badge ? (typeof p.badge === 'string' ? JSON.parse(p.badge) : p.badge) : undefined,
  }))

  return (
    <>
      <PageHero
        title="Our Products"
        subtitle="Browse our full range of genuine computer hardware"
        variant="blue"
      />
      <ProductBanner />
      <ProductsExplorer
        products={formattedProducts as any}
        whatsappNumber={settings.whatsapp_number}
        activeCategory={activeCategory}
        activeBrand={activeBrand}
        activePrice={activePrice}
        categories={facets.categoryCounts}
        brands={facets.brandCounts}
        priceCounts={facets.priceCounts}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalCount: filteredCount,
          totalPages: Math.max(1, Math.ceil(filteredCount / PAGE_SIZE)),
        }}
      />
      <CtaBanner />
    </>
  )
}
