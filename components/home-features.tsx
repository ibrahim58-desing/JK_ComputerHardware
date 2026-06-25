'use client'

import { motion } from 'framer-motion'
import { Zap, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { RevealGroup, itemVariants } from '@/components/reveal'

const features = [
  {
    icon: Zap,
    title: 'Top Performance',
    desc: 'Handpicked high-speed components',
  },
  {
    icon: ShieldCheck,
    title: 'Genuine Products',
    desc: '100% authentic hardware guaranteed',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Chennai & nationwide shipping',
  },
  {
    icon: Wrench,
    title: 'Expert Support',
    desc: 'In-store and remote assistance',
  },
]

export function HomeFeatures() {
  return (
    <section className="circuit-grid bg-background px-5 py-20 lg:px-8">
      <RevealGroup className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={itemVariants}
            className="group rounded-2xl border border-card-border bg-card p-7 shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-blue-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              <f.icon size={26} />
            </div>
            <h3 className="mt-5 font-heading text-lg font-bold text-card-foreground">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </RevealGroup>
    </section>
  )
}
