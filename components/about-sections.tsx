'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Heart } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { RevealGroup, itemVariants } from '@/components/reveal'

const storyStats = [
  { value: '2019', label: 'Founded' },
  { value: '500+', label: 'Products Stocked' },
  { value: '1000+', label: 'Builders Served' },
]

export function OurStory() {
  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-4"
        >
          {storyStats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-card-border bg-card p-5 text-center shadow-blue"
            >
              <div className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
                {s.value}
              </div>
              <p className="mt-1 text-xs text-text-secondary">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Our Story
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Honest hardware, built on trust.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-text-secondary">
            JK was founded with one goal — to bring genuine, high-performance
            computer hardware to customers at honest prices. We started as a
            small shop in Chennai and grew into a trusted destination for PC
            builders, gamers, offices, and professionals. Every product we stock
            is handpicked for quality and value.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

const values = [
  {
    icon: ShieldCheck,
    title: 'Authenticity',
    desc: 'Every component is 100% genuine, sealed, and fully warranted.',
  },
  {
    icon: Zap,
    title: 'Performance',
    desc: 'We stock only hardware that delivers real-world speed and value.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    desc: 'Honest advice, fair prices, and support long after you buy.',
  },
]

export function OurValues() {
  return (
    <section className="circuit-grid bg-background px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading label="What We Stand For" title="Our Values" align="center" />
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <motion.div
              key={v.title}
              variants={itemVariants}
              className="group rounded-2xl border border-card-border bg-card p-8 shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-blue-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <v.icon size={26} />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-card-foreground">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {v.desc}
              </p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

const team = [
  { name: 'Karthik J.', role: 'Founder & Lead Builder', initials: 'KJ' },
  { name: 'Priya R.', role: 'Hardware Specialist', initials: 'PR' },
  { name: 'Arjun M.', role: 'Repair & Support Lead', initials: 'AM' },
]

export function TeamSection() {
  return (
    <section className="bg-surface px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title="The People Behind JK" align="center" />
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {team.map((m) => (
            <motion.div
              key={m.name}
              variants={itemVariants}
              className="flex flex-col items-center rounded-2xl border border-card-border bg-card p-8 text-center shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary font-heading text-2xl font-bold text-primary-foreground">
                {m.initials}
              </div>
              <h3 className="mt-5 font-heading text-lg font-bold text-card-foreground">
                {m.name}
              </h3>
              <p className="mt-1 font-mono text-sm text-text-secondary">{m.role}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
