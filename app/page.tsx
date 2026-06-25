import { HomeHero } from '@/components/home-hero'
import { BrandsMarquee } from '@/components/brands-marquee'
import { HomeFeatures } from '@/components/home-features'
import { FeaturedProducts } from '@/components/featured-products'
import { StatsBand } from '@/components/stats-band'
import { HomeServices } from '@/components/home-services'
import { Testimonials } from '@/components/testimonials'
import { CtaBanner } from '@/components/cta-banner'

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeFeatures />
      <FeaturedProducts />
      <BrandsMarquee />
      <StatsBand heading="Why builders across Chennai choose JK." />
      <HomeServices />
      <Testimonials />
      <CtaBanner />
    </>
  )
}
