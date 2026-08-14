'use client'

import { motion } from 'framer-motion'

export function PageHero({
  title,
  subtitle,
  variant = 'blue',
}: {
  title: string
  subtitle: string
  variant?: 'blue' | 'white'
}) {
  const words = title.split(' ')
  const isBlue = variant === 'blue'

  return (
    <section
      className={`relative overflow-hidden pt-32 pb-16 ${isBlue ? 'bg-primary' : 'circuit-grid bg-background'
        }`}
    >
      {isBlue && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '54px 54px',
          }}
        />
      )}
      <div className="relative mx-auto max-w-7xl px-5 text-center lg:px-8">
        <h1
          className={`font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${isBlue ? 'text-white' : 'text-foreground'
            }`}
        >
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mr-3 inline-block"
            >
              {w}
            </motion.span>
          ))}
        </h1>
        {!isBlue && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 72 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-5 h-1 rounded-full bg-primary"
          />
        )}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty ${isBlue ? 'text-white/80' : 'text-text-secondary'
            }`}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  )
}
