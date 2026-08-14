'use client'

import { motion } from 'framer-motion'
import { MessageCircle, ArrowUpRight, Tag } from 'lucide-react'
import Link from 'next/link'
import { TiltCard } from '@/components/tilt-card'
import {
  type Product,
  badgeClasses,
} from '@/lib/products'
import { itemVariants } from '@/components/reveal'
import { whatsappHref } from '@/lib/settings'

export function ProductCard({ product, whatsappNumber = '' }: { product: Product; whatsappNumber?: string }) {
  const waMessage = `Hi JK Infosystem! I am interested in buying ${product.name}. Please share availability and details.`
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0

  return (
    <motion.div variants={itemVariants} layout className="h-full">
      <TiltCard
        max={8}
        sheen={false}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-blue transition-all duration-300 hover:border-primary hover:shadow-blue-lg relative"
      >
        {/* Invisible Link stretching over card */}
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />

        {/* Product Image */}
        <div className="relative z-10 aspect-[4/3] overflow-hidden bg-surface pointer-events-none">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {product.offer && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
              <Tag size={11} />
              {product.offer}
            </span>
          )}

          {product.badge && (
            <span
              className={`absolute right-3 top-3 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide shadow-md backdrop-blur-md ${badgeClasses[product.badge.tone]}`}
            >
              {product.badge.label}
            </span>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="rounded-full bg-black/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                Out of Stock
              </span>
            </div>
          )}

          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/95 text-foreground opacity-0 shadow-md ring-1 ring-black/5 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </span>
        </div>

        {/* Product Info */}
        <div className="relative z-10 flex flex-1 flex-col p-5 pointer-events-none">
          {product.brand && (
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">
              {product.brand}
            </span>
          )}

          <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-card-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.specs.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-md border border-card-border bg-surface px-2 py-1 font-mono text-[11px] text-text-secondary"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <div className="mt-5 flex items-end justify-between gap-2 border-t border-card-border pt-4">
              <div>
                <span className="block text-[11px] font-medium text-text-secondary">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-primary">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm font-medium text-text-secondary line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
              {!outOfStock && (
                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  In Stock
                </span>
              )}
            </div>

            <a
              href={whatsappHref(whatsappNumber, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={16} />
              WhatsApp to Order
            </a>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}
