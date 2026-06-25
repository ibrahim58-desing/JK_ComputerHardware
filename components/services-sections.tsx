'use client'

import { motion } from 'framer-motion'
import {
  MonitorCog,
  Wrench,
  ArrowUpCircle,
  ShieldCheck,
  PackageSearch,
  MessagesSquare,
  Phone,
  ClipboardCheck,
  Hammer,
  Rocket,
} from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { RevealGroup, itemVariants } from '@/components/reveal'

const services = [
  {
    icon: MonitorCog,
    title: 'Custom PC Building',
    desc: 'We build gaming rigs, workstations, and office setups tailored to your exact budget and requirements.',
  },
  {
    icon: Wrench,
    title: 'Hardware Repair',
    desc: 'Fast diagnosis and repair for all desktop hardware issues. Transparent pricing, no hidden charges.',
  },
  {
    icon: ArrowUpCircle,
    title: 'PC Upgrades',
    desc: 'Boost your system with faster RAM, better GPU, or NVMe SSD. We handle compatibility and safe installation.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Support',
    desc: 'All products come with manufacturer warranty. We handle claims and replacements hassle-free.',
  },
  {
    icon: PackageSearch,
    title: 'Hardware Sourcing',
    desc: "Can't find a specific part? We source genuine components from trusted distributors across India.",
  },
  {
    icon: MessagesSquare,
    title: 'Tech Consultation',
    desc: 'Not sure what to buy? Our experts guide you to the right components — no pressure, just honest advice.',
  },
]

export function ServicesGrid() {
  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <RevealGroup className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <motion.div
            key={s.title}
            variants={itemVariants}
            className="group rounded-2xl border border-card-border bg-card p-8 shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-blue-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              <s.icon size={26} />
            </div>
            <h3 className="mt-5 font-heading text-xl font-bold text-card-foreground">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </RevealGroup>
    </section>
  )
}

const steps = [
  { icon: Phone, title: 'Contact Us', desc: 'Tell us your needs or issue.' },
  { icon: ClipboardCheck, title: 'We Assess', desc: 'Quote & plan upfront.' },
  { icon: Hammer, title: 'We Build / Fix', desc: 'Expert hands at work.' },
  { icon: Rocket, title: "You're Ready", desc: 'Pick up & power on.' },
]

export function HowItWorks() {
  return (
    <section className="circuit-grid bg-surface px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading label="Process" title="How It Works" align="center" />
        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-primary/30 lg:block"
          />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.18, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground shadow-blue-lg">
                  {i + 1}
                </div>
                <s.icon size={22} className="mt-5 text-primary" />
                <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function PricingNote() {
  return (
    <section className="bg-background px-5 py-16 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl rounded-2xl border-l-4 border-primary bg-accent px-8 py-8 text-center"
      >
        <p className="font-heading text-lg font-bold text-foreground sm:text-xl">
          All service prices are quoted upfront. No hidden charges. Ever.
        </p>
      </motion.div>
    </section>
  )
}
