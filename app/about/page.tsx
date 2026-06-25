import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { OurStory, OurValues, TeamSection } from '@/components/about-sections'
import { StatsBand } from '@/components/stats-band'
import { CtaBanner } from '@/components/cta-banner'

export const metadata: Metadata = {
  title: 'About — JK Computers',
  description:
    "Chennai's trusted name in computer hardware since 2019. Learn the story, values and people behind JK Computers.",
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Who We Are"
        subtitle="Chennai's trusted name in computer hardware since 2019"
        variant="blue"
      />
      <OurStory />
      <StatsBand />
      <OurValues />
      <TeamSection />
      <CtaBanner />
    </>
  )
}
