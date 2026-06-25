import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { ProductBanner } from '@/components/product-banner'
import { ProductsExplorer } from '@/components/products-explorer'
import { CtaBanner } from '@/components/cta-banner'

export const metadata: Metadata = {
  title: 'Products — JK Computers',
  description:
    'Browse our full range of genuine computer hardware — CPUs, GPUs, RAM, storage, monitors, keyboards and mice at honest prices in Chennai.',
}

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="Our Products"
        subtitle="Browse our full range of genuine computer hardware"
        variant="white"
      />
      <ProductBanner />
      <ProductsExplorer />
      <CtaBanner />
    </>
  )
}
