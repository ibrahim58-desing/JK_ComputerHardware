'use client'

import { motion } from 'framer-motion'
import { CountUp } from '@/components/count-up'

const FOUNDED_YEAR = 1999

export function StatsBand({ heading }: { heading?: string }) {
  const stats = [
    { end: FOUNDED_YEAR, suffix: '', label: 'Founded' },
    { end: new Date().getFullYear() - FOUNDED_YEAR, suffix: '+', label: 'Years of Experience' },
    { end: 10, suffix: '', label: 'Team Members' },
    { end: 9, suffix: '+', label: 'Services Offered' },
  ]
  return (
    <section className="relative overflow-hidden bg-primary py-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 30%, #fff 0, transparent 40%), linear-gradient(to right, #fff 1px, transparent 1px)',
          backgroundSize: 'auto, 54px 54px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {heading && (
          <h2 className="mb-12 max-w-xl font-heading text-3xl font-bold text-white sm:text-4xl text-balance">
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <div className="font-heading text-4xl font-extrabold text-white sm:text-5xl">
                <CountUp end={s.end} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm font-medium uppercase tracking-wide text-white/70">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
