'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { HeroCanvas } from '@/components/hero-canvas'


const headlineWords = ['Experience', 'Technology', 'Without', 'Compromise.']

export function HomeHero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-primary pt-16">
      {/* circuit grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '54px 54px',
        }}
      />
      <HeroCanvas />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-5 py-20 text-center lg:px-8">
        <div className="flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex animate-pulse-soft items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-sm font-medium text-white"
          >
            <Sparkles size={15} />
            Trusted Technology Partner Since 1999
          </motion.span>

          <h1 className="mt-6 font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {headlineWords.map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`mr-3 inline-block ${i === headlineWords.length - 1 ? 'text-blue-200' : ''}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/80"
          >
            From premium computers and professional imaging solutions to
            enterprise-grade IT services, JK Infosystem delivers authentic
            technology, trusted expertise, and exceptional service — all under
            one roof.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm tracking-wide text-white/60"
          >
            <span>✓ Genuine Products</span>
            <span>·</span>
            <span>✓ Pan-India Technology Partner</span>
            <span>·</span>
            <span>✓ Expert Advice</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.45 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/products"
              className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-primary transition-transform hover:scale-[1.04] hover:shadow-blue-lg"
            >
              Browse Products
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/[PHONE NUMBER]?text=Hi%20JK%20Infosystem!%20I%20would%20like%20to%20place%20an%20order.%20Please%20share%20details."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/60 px-7 py-3.5 font-semibold text-white transition-all hover:border-white hover:shadow-[0_0_24px_rgba(255,255,255,0.35)]"
            >
              Contact to Order
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 font-mono text-sm text-white/70"
          >
            Trusted Since 1999 · Pan-India Service · Computers, Imaging &amp; IT Solutions
          </motion.p>
        </div>


      </div>
    </section>
  )
}
