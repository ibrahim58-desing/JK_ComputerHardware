'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function CtaBanner() {
  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl border-2 border-primary/20 bg-card px-8 py-14 text-center shadow-blue md:flex-row md:justify-between md:text-left"
      >
        <h2 className="max-w-xl font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
          Ready to build your dream PC? Let&apos;s make it happen.
        </h2>
        <Link
          href="/contact"
          className="group flex shrink-0 items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-transform hover:scale-[1.04] hover:shadow-blue-lg"
        >
          Get in Touch
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  )
}
