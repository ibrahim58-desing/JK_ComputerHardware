'use client'

import { motion } from 'framer-motion'
import { brands } from '@/lib/products'

export function BrandsMarquee() {
  // Duplicate the brands array to create a seamless infinite loop
  const duplicatedBrands = [...brands, ...brands, ...brands]

  return (
    <section className="border-b border-t border-card-border bg-surface py-14 overflow-hidden">
      <div className="relative flex max-w-full overflow-hidden">
        {/* Left gradient mask */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-surface to-transparent" />

        {/* Right gradient mask */}
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-surface to-transparent" />

        <motion.div
          animate={{
            x: ['0%', '-33.33%'],
          }}
          transition={{
            ease: 'linear',
            duration: 20,
            repeat: Infinity,
          }}
          className="flex whitespace-nowrap items-center"
        >
          {duplicatedBrands.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="mx-12 font-heading text-2xl font-bold uppercase tracking-widest text-text-secondary/40 transition-colors hover:text-primary"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
