import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import {
  ServicesGrid,
  HowItWorks,
  PricingNote,
} from '@/components/services-sections'
import { CtaBanner } from '@/components/cta-banner'

export const metadata: Metadata = {
  title: 'Services — JK Infosystem',
  description:
    'End-to-end technology services: PC building, laptop & mobile repair, screen replacement, data recovery, OS installation, hardware upgrades and warranty support.',
}

// Must stay dynamic — see app/page.tsx for why (CSP nonce vs. static cache).
export const dynamic = 'force-dynamic'

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="What We Do"
        subtitle="End-to-end technology solutions for every need"
        variant="blue"
      />
      <ServicesGrid />
      <HowItWorks />
      <PricingNote />
      <CtaBanner />
    </>
  )
}
