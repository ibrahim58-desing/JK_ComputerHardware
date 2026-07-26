import { HomeHero } from '@/components/home-hero'
import { BrandsMarquee } from '@/components/brands-marquee'
import { HomeFeatures } from '@/components/home-features'
import { FeaturedProducts } from '@/components/featured-products'
import { HomepageCategorySections } from '@/components/homepage-category-sections'
import { StatsBand } from '@/components/stats-band'
import { HomeServices } from '@/components/home-services'
import { Testimonials } from '@/components/testimonials'
import { CtaBanner } from '@/components/cta-banner'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const featuredDb = await prisma.product.findMany({
    where: { 
      status: 'active', 
      featured: true,
      image: { not: '/placeholder.jpg' },
    },
    include: { category: true },
    take: 4,
  })
  
  const formattedFeatured = featuredDb.map(p => ({
    ...p,
    category: p.category?.name || 'Hardware',
    badge: p.badge ? (typeof p.badge === 'string' ? JSON.parse(p.badge) : p.badge) : undefined,
  }))

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
      <HomeHero />
      <HomeFeatures />
      <FeaturedProducts featuredProducts={formattedFeatured as any} />
      <HomepageCategorySections sections={categorySections} />
      <BrandsMarquee />
      <StatsBand heading="Why customers across India choose JK Infosystem." />
      <HomeServices />
      <Testimonials />
      <CtaBanner />
    </>
  )
}
