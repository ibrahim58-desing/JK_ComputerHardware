'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { RevealGroup, itemVariants } from '@/components/reveal'

const services = [
  {
    icon: '🖥️',
    title: 'Custom PC Building',
    desc: 'We assemble the perfect PC for your budget.',
  },
  {
    icon: '🔧',
    title: 'Hardware Repair',
    desc: 'Fast and affordable repair for all desktop issues.',
  },
  {
    icon: '⬆️',
    title: 'Upgrades & Consultation',
    desc: 'Boost your current system with expert guidance.',
  },
]

export function HomeServices() {
  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="We Don't Just Sell — We Build & Fix Too"
          description="From custom PC builds to hardware repairs, we've got you covered."
          align="center"
        />
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <motion.div
              key={s.title}
              variants={itemVariants}
              className="group rounded-2xl border border-card-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary"
              style={{ boxShadow: '0 4px 24px rgba(0, 87, 255, 0.08)' }}
            >
              <span className="text-4xl">{s.icon}</span>
              <h3 className="mt-5 font-heading text-lg font-bold text-card-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {s.desc}
              </p>
              <Link
                href="/services"
                className="mt-6 inline-flex items-center rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                Learn More
              </Link>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
