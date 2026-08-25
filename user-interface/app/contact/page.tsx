import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { ContactForm } from '@/components/contact-form'
import {
  ContactInfo,
  MapSection,
  FaqSection,
} from '@/components/contact-sections'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Contact — JK Infosystem',
  description:
    'Get in touch with JK Infosystem — your trusted Pan-India technology partner. Visit, call, or send us a message.',
}

// Must stay dynamic — see app/page.tsx for why (CSP nonce vs. static cache).
export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const settings = await getSiteSettings()
  return (
    <>
      <PageHero
        title="Get In Touch"
        subtitle="Visit us, call us, or drop a message"
        variant="blue"
      />
      <section className="bg-background px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <ContactInfo settings={settings} />
          <ContactForm />
        </div>
      </section>
      <MapSection />
      <FaqSection />
    </>
  )
}
