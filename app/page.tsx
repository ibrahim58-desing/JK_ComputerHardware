import { HomeHero } from '@/components/home-hero'
import { BrandsMarquee } from '@/components/brands-marquee'
import { HomeFeatures } from '@/components/home-features'
import { TopProductsShowcase } from '@/components/top-products-showcase'
import { HomepageCategorySections } from '@/components/homepage-category-sections'
import { StatsBand } from '@/components/stats-band'
import { HomeServices } from '@/components/home-services'
import { Testimonials } from '@/components/testimonials'
import { CtaBanner } from '@/components/cta-banner'
import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/settings'

export default async function HomePage() {
  const settings = await getSiteSettings()

  const testimonials = await prisma.testimonial.findMany({
    where: { status: 'active' },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  })

  // Fetch Top Products Setting
  const topProductsSetting = await prisma.siteSetting.findUnique({
    where: { key: 'top_products' }
  })

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

  // Fetch Homepage Categories Setting
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'homepage_categories' }
  })

  let categorySections: any[] = []
  
  if (setting && setting.value) {
    try {
      const categoryIds = JSON.parse(setting.value) as string[]
      
      // Fetch each category's top 4 products with images
      for (const catId of categoryIds) {
        const id = parseInt(catId, 10)
        const category = await prisma.category.findUnique({ where: { id } })
        if (category) {
          const products = await prisma.product.findMany({
            where: {
              categoryId: id,
              status: 'active',
              image: { not: '/placeholder.jpg' }
            },
            take: 12,
            orderBy: { createdAt: 'desc' }
          })
          
          if (products.length > 0) {
            categorySections.push({
              category: { id: category.id, name: category.name },
              products
            })
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse homepage_categories setting', e)
    }
  }

  return (
    <>
      <HomeHero whatsappNumber={settings.whatsapp_number} />
      <HomeFeatures />
      <TopProductsShowcase products={topProducts as any} />
      <HomepageCategorySections sections={categorySections} />
      <BrandsMarquee />
      <StatsBand heading="Why customers across India choose JK Infosystem." />
      <HomeServices />
      <Testimonials testimonials={testimonials} />
      <CtaBanner />
    </>
  )
}
