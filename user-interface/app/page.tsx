import { HomeHero } from '@/components/home-hero'
import { BrandsMarquee } from '@/components/brands-marquee'
import { HomeFeatures } from '@/components/home-features'
import { TopProductsShowcase } from '@/components/top-products-showcase'
import { HomepageCategorySections } from '@/components/homepage-category-sections'
import { StatsBand } from '@/components/stats-band'
import { HomeServices } from '@/components/home-services'
import { CommentsSection } from '@/components/comments-section'
import { CtaBanner } from '@/components/cta-banner'
import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'

export default async function HomePage() {
  // Independent lookups — run them together instead of one-by-one.
  const [settings, comments, topProductsSetting, homepageCategoriesSetting] = await Promise.all([
    getSiteSettings(),
    prisma.comment.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.siteSetting.findUnique({ where: { key: 'top_products' } }),
    prisma.siteSetting.findUnique({ where: { key: 'homepage_categories' } }),
  ])

  let topProducts: any[] = []

  if (topProductsSetting && topProductsSetting.value) {
    try {
      const topProductIds = (JSON.parse(topProductsSetting.value) as string[]).map((id) => parseInt(id, 10))
      const topProductsDb = await prisma.product.findMany({
        where: { id: { in: topProductIds }, status: 'active' },
      })
      const topProductsById = new Map(topProductsDb.map((p) => [p.id, p]))
      topProducts = topProductIds
        .map((id) => topProductsById.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
    } catch (e) {
      console.error('Failed to parse top_products setting', e)
    }
  }

  let categorySections: any[] = []

  if (homepageCategoriesSetting && homepageCategoriesSetting.value) {
    try {
      const categoryIds = (JSON.parse(homepageCategoriesSetting.value) as string[]).map((id) => parseInt(id, 10))

      // Fetch categories in one query, then each category's products in
      // parallel instead of round-tripping the DB twice per category
      // sequentially.
      const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } })
      const categoryById = new Map(categories.map((c) => [c.id, c]))

      const productLists = await Promise.all(
        categoryIds.map((id) =>
          prisma.product.findMany({
            where: {
              categoryId: id,
              status: 'active',
            },
            take: 12,
            orderBy: { createdAt: 'desc' },
          })
        )
      )

      categorySections = categoryIds
        .map((id, i) => {
          const category = categoryById.get(id)
          const products = productLists[i]
          if (!category || products.length === 0) return null
          return {
            category: { id: category.id, name: category.name },
            products: products.map((p) => ({
              ...p,
              category: category.name,
              badge: p.badge ? (typeof p.badge === 'string' ? JSON.parse(p.badge) : p.badge) : undefined,
            })),
          }
        })
        .filter((s): s is NonNullable<typeof s> => s !== null)
    } catch (e) {
      console.error('Failed to parse homepage_categories setting', e)
    }
  }

  return (
    <>
      <HomeHero whatsappNumber={settings.whatsapp_number} />
      <HomeFeatures />
      <TopProductsShowcase products={topProducts as any} />
      <HomepageCategorySections sections={categorySections} whatsappNumber={settings.whatsapp_number} />
      <BrandsMarquee />
      <StatsBand heading="Why customers across India choose JK Infosystem." />
      <HomeServices />
      <CommentsSection initialComments={comments as any} />
      <CtaBanner />
    </>
  )
}
