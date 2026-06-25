import Link from 'next/link'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from '@/components/social-icons'

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
      { label: 'Consultation', href: '/services' },
    ],
  },
]

const trustPills = [
  'Genuine',
  'Warranted',
  'Expert Advice',
  'No Hidden Charges',
]

export function Footer() {
  return (
    <footer className="relative bg-navy text-white">
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, #0057ff, #6c2fff)',
          boxShadow: '0 0 12px rgba(0,87,255,0.5)',
        }}
      />
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="font-heading text-3xl font-extrabold text-white">
              JK
            </span>
            <p className="mt-3 font-heading text-sm tracking-wide text-blue-200/80">
              Power Your Build.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Chennai&apos;s trusted destination for genuine, high-performance
              computer hardware at honest prices.
            </p>
            <div className="mt-5 flex gap-3">
              {[InstagramIcon, FacebookIcon, YoutubeIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
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
                <span>123, Anna Salai, Chennai, TN - 600002</span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex gap-2.5">
                <MessageCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#25D366' }} />
                <span>+91 98765 43210 (WhatsApp)</span>
              </li>
              <li className="flex gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>hello@jkcomputers.in</span>
              </li>
            </ul>

            <a
              href="https://www.google.com/maps/search/?api=1&query=123+Anna+Salai+Chennai+Tamil+Nadu+600002"
              target="_blank"
              rel="noopener noreferrer"
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
          © 2025 JK Computers. All rights reserved. · Made in Chennai 🇮🇳
        </div>
      </div>
    </footer>
  )
}
