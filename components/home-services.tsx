'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Cpu, Smartphone, ArrowUpCircle } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { RevealGroup, itemVariants } from '@/components/reveal'

const services = [
  {
    icon: Cpu,
    title: 'PC Building & Assembly',
    desc: 'We assemble the perfect PC for your budget.',
  },
  {
    icon: Smartphone,
    title: 'Laptop & Mobile Repair',
    desc: 'Fast, affordable repair for laptops, phones & tablets.',
  },
  {
    icon: ArrowUpCircle,
    title: 'Hardware Upgrades',
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
              className="group rounded-2xl border border-card-border bg-card p-8 shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-blue-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                <s.icon size={26} />
              </div>
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
