'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { TiltCard } from '@/components/tilt-card'
import {
  type Product,
  categoryIcons,
  badgeClasses,
} from '@/lib/products'
import { itemVariants } from '@/components/reveal'

export function ProductCard({ product }: { product: Product }) {
  const Icon = categoryIcons[product.category as keyof typeof categoryIcons]
  const waMessage = encodeURIComponent(
    `Hi JK Infosystem! I am interested in buying ${product.name}. Please share availability and details.`
  )
  return (
    <motion.div variants={itemVariants} layout className="h-full">
      <TiltCard
        max={10}
        className="group h-full rounded-2xl border border-card-border bg-card p-6 shadow-blue transition-colors duration-300 hover:border-primary relative"
      >
        {/* Invisible Link stretching over card */}
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-0 rounded-2xl" aria-label={`View ${product.name}`} />

        {/* Product Image */}
        <div className="relative z-10 rounded-xl overflow-hidden bg-surface aspect-[4/3] mb-4 -mx-2 -mt-2 pointer-events-none" style={{ transform: 'translateZ(30px)' }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 backdrop-blur-md text-primary border border-white/10">
            {Icon ? <Icon size={20} /> : null}
          </div>
          {product.badge && (
            <span
              className={`absolute top-3 right-3 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md ${badgeClasses[product.badge.tone]}`}
            >
              {product.badge.label}
            </span>
          )}
        </div>

        <div className="relative z-10 pointer-events-none group-hover:text-primary transition-colors">
          <h3
            className="mt-5 text-lg font-bold leading-snug text-card-foreground"
            style={{ transform: 'translateZ(20px)' }}
          >
            {product.name}
          </h3>
        </div>

        <div className="relative z-10 pointer-events-none mt-3 flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <span
              key={s}
              className="rounded-md bg-surface px-2 py-1 font-mono text-[11px] text-text-secondary"
            >
              {s}
            </span>
          ))}
        </div>

        <div
          className="relative z-10 pointer-events-none mt-6 flex items-center justify-between"
          style={{ transform: 'translateZ(25px)' }}
        >
          <span className="font-heading text-2xl font-bold text-primary">
            {product.price}
          </span>
        </div>

        <a
          href={`https://wa.me/[PHONE NUMBER]?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#25D366', transform: 'translateZ(30px)' }}
        >
          <MessageCircle size={16} />
          WhatsApp to Order
        </a>
      </TiltCard>
    </motion.div>
  )
}

