import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { ContactForm } from '@/components/contact-form'
import {
  ContactInfo,
  MapSection,
  FaqSection,
} from '@/components/contact-sections'

export const metadata: Metadata = {
  title: 'Contact — JK Computers',
  description:
    'Visit us at Anna Salai Chennai, call +91 98765 43210, or send a message. JK Computers — your trusted hardware store.',
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Get In Touch"
        subtitle="Visit us, call us, or drop a message"
        variant="blue"
      />
      <section className="bg-background px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <ContactInfo />
          <ContactForm />
        </div>
      </section>
      <MapSection />
      <FaqSection />
    </>
  )
}
