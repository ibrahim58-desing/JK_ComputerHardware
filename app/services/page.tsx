import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import {
  ServicesGrid,
  HowItWorks,
  PricingNote,
} from '@/components/services-sections'
import { CtaBanner } from '@/components/cta-banner'

export const metadata: Metadata = {
  title: 'Services — JK Computers',
  description:
    'End-to-end hardware solutions: custom PC building, repairs, upgrades, warranty support, sourcing and tech consultation in Chennai.',
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="What We Do"
        subtitle="End-to-end hardware solutions for every need"
        variant="blue"
      />
      <ServicesGrid />
      <HowItWorks />
      <PricingNote />
      <CtaBanner />
    </>
  )
}
