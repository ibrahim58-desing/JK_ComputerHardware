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
  const Icon = categoryIcons[product.category]
  const waMessage = encodeURIComponent(
    `Hi JK Computers! I am interested in buying ${product.name}. Please share availability and details.`
  )
  return (
    <motion.div variants={itemVariants} layout className="h-full">
      <TiltCard
        max={10}
        className="group h-full rounded-2xl border border-card-border bg-card p-6 shadow-blue transition-colors duration-300 hover:border-primary"
      >
        <div className="flex items-start justify-between" style={{ transform: 'translateZ(30px)' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon size={24} />
          </div>
          {product.badge && (
            <span
              className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide ${badgeClasses[product.badge.tone]}`}
            >
              {product.badge.label}
            </span>
          )}
        </div>

        <Link href={`/products/${product.id}`} className="group-hover:text-primary transition-colors">
          <h3
            className="mt-5 text-lg font-bold leading-snug text-card-foreground"
            style={{ transform: 'translateZ(20px)' }}
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap gap-1.5">
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
          className="mt-6 flex items-center justify-between"
          style={{ transform: 'translateZ(25px)' }}
        >
          <span className="font-heading text-2xl font-bold text-primary">
            {product.price}
          </span>
        </div>

        <a
          href={`https://wa.me/919876543210?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle size={16} />
          WhatsApp to Order
        </a>
      </TiltCard>
    </motion.div>
  )
}

