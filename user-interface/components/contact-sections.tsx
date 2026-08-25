'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ChevronDown,
  Navigation,
} from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from '@/components/social-icons'
import { type SiteSettings, whatsappHref, telHref, mailHref } from '@/lib/settings'

export function ContactInfo({ settings }: { settings: SiteSettings }) {
  const info = [
    {
      icon: MapPin,
      text: settings.contact_address || 'Address coming soon',
      href: settings.google_maps_url || undefined,
      external: true,
    },
    {
      icon: Phone,
      text: settings.contact_phone || 'Phone coming soon',
      href: settings.contact_phone ? telHref(settings.contact_phone) : undefined,
      external: false,
    },
    {
      icon: Mail,
      text: settings.contact_email || 'Email coming soon',
      href: settings.contact_email ? mailHref(settings.contact_email) : undefined,
      external: false,
    },
    { icon: Clock, text: settings.working_hours || 'Hours coming soon', href: undefined, external: false },
  ]
  const socialLinks = [
    { Icon: InstagramIcon, href: settings.instagram_url },
    { Icon: FacebookIcon, href: settings.facebook_url },
    { Icon: YoutubeIcon, href: settings.youtube_url },
  ]

  return (
    <div className="flex flex-col gap-6">
      <ul className="space-y-4">
        {info.map((i) => (
          <li
            key={i.text}
            className="flex items-start gap-4 rounded-2xl border border-card-border bg-card p-5 shadow-blue"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <i.icon size={20} />
            </div>
            {i.href ? (
              <a
                href={i.href}
                target={i.external ? '_blank' : undefined}
                rel={i.external ? 'noopener noreferrer' : undefined}
                className="pt-1.5 text-sm leading-relaxed text-foreground transition-colors hover:text-primary"
              >
                {i.text}
              </a>
            ) : (
              <span className="pt-1.5 text-sm leading-relaxed text-foreground">
                {i.text}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={telHref(settings.contact_phone)}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          <Phone size={18} />
          Call Now
        </a>
        <a
          href={whatsappHref(settings.whatsapp_number)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: '#25D366', boxShadow: '0 0 22px rgba(37,211,102,0.45)' }}
        >
          <MessageCircle size={18} />
          Chat on WhatsApp
        </a>
      </div>

      <a
        href={settings.google_maps_url || '#'}
        target={settings.google_maps_url ? '_blank' : undefined}
        rel={settings.google_maps_url ? 'noopener noreferrer' : undefined}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 py-3.5 font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
      >
        <Navigation size={18} />
        Get Directions
      </a>

      <div className="flex gap-3">
        {socialLinks.map(({ Icon, href }, i) => (
          <a
            key={i}
            href={href || '#'}
            target={href ? '_blank' : undefined}
            rel={href ? 'noopener noreferrer' : undefined}
            aria-label="Social link"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-card-border bg-card text-text-secondary transition-all hover:scale-110 hover:border-primary hover:text-primary"
          >
            <Icon size={18} />
          </a>
        ))}
      </div>
    </div>
  )
}

export function MapSection() {
  return (
    <section className="bg-surface px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title="Find Our Store" align="center" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 overflow-hidden rounded-3xl border border-card-border shadow-blue"
        >
          <iframe
            title="JK Infosystem location on map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=80.24%2C13.05%2C80.29%2C13.09&layer=mapnik&marker=13.0707%2C80.2609"
            className="h-[420px] w-full"
            style={{ filter: 'hue-rotate(180deg) saturate(0.85) contrast(0.95)' }}
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}

const faqs = [
  {
    q: 'Do you offer home delivery?',
    a: 'Yes, we offer free home delivery* and ship Pan-India.',
  },
  {
    q: 'Are your products original and warranted?',
    a: 'Yes, 100% genuine with full manufacturer warranty.',
  },
  {
    q: 'How long does a PC build take?',
    a: 'Usually 1–2 business days depending on parts.',
  },
  {
    q: 'Do you repair laptops and mobile devices?',
    a: 'Yes — we service laptops, mobile phones, and tablets across all major OS platforms, in addition to desktop hardware.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading label="FAQ" title="Common Questions" align="center" />
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-blue transition-colors"
                style={{
                  borderBottom: isOpen
                    ? '2px solid #0057ff'
                    : '2px solid transparent',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-accent/60"
                >
                  <span className="font-heading text-base font-bold text-card-foreground">
                    {f.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-primary transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
