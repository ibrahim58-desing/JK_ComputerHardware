'use client'

import { motion } from 'framer-motion'

const badges = [
  {
    icon: '🛡️',
    title: 'Qualified Sales & Service Team',
    sub: 'Every team member is trained and experienced',
  },
  {
    icon: '⭐',
    title: 'Trusted Since 1999',
    sub: 'Built on integrity, chosen by customers across India',
  },
  {
    icon: '🔧',
    title: 'Reliable After-Sales Service',
    sub: 'Dependable support long after your purchase',
  },
  {
    icon: '🚚',
    title: 'Pan-India Sales & Support',
    sub: 'Serving customers nationwide',
  },
]

export function TrustBadges() {
  return (
    <section
      className="border-b-2 bg-white px-5 py-6 lg:px-8"
      style={{ borderBottomColor: '#0057FF' }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {badges.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-w-[280px] items-center gap-3"
          >
            <span className="shrink-0 text-3xl" style={{ color: '#0057FF' }}>{b.icon}</span>
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">{b.title}</p>
              <p className="mt-0.5 text-xs leading-snug text-text-secondary">{b.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
