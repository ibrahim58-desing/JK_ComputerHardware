'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { ProductCard } from '@/components/product-card'
import { RevealGroup } from '@/components/reveal'
import { products } from '@/lib/products'

// Intel i9-13900K | RTX 4070 | LG 4K Monitor | Keychron K8 Pro
const featuredIds = [1, 3, 5, 7]

export function FeaturedProducts() {
  const featured = featuredIds
    .map((id) => products.find((p) => p.id === id)!)
    .filter(Boolean)

  return (
    <section className="bg-surface px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Featured"
          title="Our Most Popular Hardware"
          align="center"
        />
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </RevealGroup>
        <div className="mt-12 flex justify-center">
          <Link
            href="/products"
            className="group flex items-center gap-2 rounded-full border-2 border-primary px-7 py-3 font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            View All Products
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
