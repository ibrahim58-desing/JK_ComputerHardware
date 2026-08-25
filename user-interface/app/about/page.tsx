import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { OurStory, OurValues } from '@/components/about-sections'
import { StatsBand } from '@/components/stats-band'
import { CtaBanner } from '@/components/cta-banner'

export const metadata: Metadata = {
  title: 'About — JK Infosystem',
  description:
    "JK Infosystem — a Pan-India technology partner delivering genuine computers, imaging solutions and IT services since 1999. Learn our story and values.",
}

// Must stay dynamic — see app/page.tsx for why (CSP nonce vs. static cache).
export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Who We Are"
        subtitle="Pan-India technology partner since 1999"
        variant="blue"
      />
      <OurStory />
      <StatsBand />
      <OurValues />
      <CtaBanner />
    </>
  )
}
