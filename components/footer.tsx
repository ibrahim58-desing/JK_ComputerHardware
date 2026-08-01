import Link from 'next/link'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from '@/components/social-icons'
import { type SiteSettings } from '@/lib/settings'

const cols = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Products',
    links: [
      { label: 'CPU', href: '/products' },
      { label: 'GPU', href: '/products' },
      { label: 'RAM', href: '/products' },
      { label: 'Storage', href: '/products' },
      { label: 'Monitors', href: '/products' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'PC Build', href: '/services' },
      { label: 'Repair', href: '/services' },
      { label: 'Upgrades', href: '/services' },
      { label: 'Warranty Support', href: '/services' },
    ],
  },
]

const trustPills = [
  'Genuine',
  'Warranted',
  'Expert Advice',
  'No Hidden Charges',
]

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()
  const socialLinks = [
    { Icon: InstagramIcon, href: settings.instagram_url },
    { Icon: FacebookIcon, href: settings.facebook_url },
    { Icon: YoutubeIcon, href: settings.youtube_url },
  ]
  return (
    <footer className="relative bg-navy text-white">
      <div className="h-px w-full bg-white/15" />
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="font-heading text-3xl font-extrabold text-white">
              JK
            </span>
            <p className="mt-3 font-heading text-sm tracking-wide text-blue-200/80">
              Chennai&apos;s Trusted PC Hardware Destination
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Pan-India technology partner delivering genuine computers,
              imaging solutions &amp; IT services since 1999.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href || '#'}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noopener noreferrer' : undefined}
                  aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:scale-110 hover:border-primary hover:text-primary"
                  style={{ transitionDuration: '200ms' }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/60 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{settings.contact_address || 'Address coming soon'}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{settings.contact_phone || 'Phone coming soon'}</span>
              </li>
              <li className="flex gap-2.5">
                <MessageCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#25D366' }} />
                <span>{settings.whatsapp_number || 'WhatsApp coming soon'} (WhatsApp)</span>
              </li>
              <li className="flex gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{settings.contact_email || 'Email coming soon'}</span>
              </li>
            </ul>

            <a
              href={settings.google_maps_url || '#'}
              target={settings.google_maps_url ? '_blank' : undefined}
              rel={settings.google_maps_url ? 'noopener noreferrer' : undefined}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10"
            >
              Visit Our Store
            </a>
          </div>
        </div>

        {/* Trust / Payment Pill Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {trustPills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70"
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © {year} JK Infosystem. All rights reserved. · Made in Chennai 🇮🇳
        </div>
      </div>
    </footer>
  )
}
