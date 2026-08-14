'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion'
import Link from 'next/link'
import { ImageIcon } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

type TopProduct = {
  id: number
  name: string
  price: string
  image: string
}

const ITEM_WIDTH = 220
const SPEED_PX_PER_SEC = 55
// How far (in px) from dead-center a product still gets some zoom boost.
const ZOOM_FALLOFF = 180
const MAX_SCALE_BOOST = 0.14

function ShowcaseCard({
  product,
  index,
  x,
  containerWidth,
}: {
  product: TopProduct
  index: number
  x: ReturnType<typeof useMotionValue<number>>
  containerWidth: number
}) {
  const scale = useTransform(x, (latestX) => {
    if (!containerWidth) return 1
    const itemCenter = index * ITEM_WIDTH + ITEM_WIDTH / 2 + latestX
    const distance = Math.abs(itemCenter - containerWidth / 2)
    const proximity = Math.max(0, 1 - distance / ZOOM_FALLOFF)
    return 1 + proximity * MAX_SCALE_BOOST
  })

  const boxShadow = useTransform(scale, (s) => {
    const intensity = Math.max(0, (s - 1) / MAX_SCALE_BOOST)
    return `0 ${10 + intensity * 20}px ${30 + intensity * 40}px rgba(0,0,0,${0.08 + intensity * 0.18})`
  })

  const zIndex = useTransform(scale, (s) => Math.round(s * 10))

  return (
    <motion.div
      style={{ width: ITEM_WIDTH, scale, zIndex, boxShadow }}
      className="shrink-0 px-3"
    >
      <Link
        href={`/products/${product.id}`}
        className="group block overflow-hidden rounded-2xl border border-card-border bg-card p-4 transition-colors hover:border-primary"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
          {product.image && product.image !== '/placeholder.jpg' ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="text-text-secondary opacity-20" size={32} />
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 font-heading text-lg font-bold text-primary">{product.price}</p>
        </div>
      </Link>
    </motion.div>
  )
}

export function TopProductsShowcase({ products }: { products: TopProduct[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const x = useMotionValue(0)

  const oneSetWidth = products.length * ITEM_WIDTH
  const loop = [...products, ...products, ...products]

  useEffect(() => {
    const update = () => setContainerWidth(containerRef.current?.offsetWidth ?? 0)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    // Start in the middle copy so both directions have buffer to loop through.
    x.set(-oneSetWidth)
  }, [oneSetWidth, x])

  useAnimationFrame((_t, delta) => {
    if (!oneSetWidth) return
    let next = x.get() - (SPEED_PX_PER_SEC * delta) / 1000
    if (next <= -oneSetWidth * 2) next += oneSetWidth
    x.set(next)
  })

  if (!products.length) return null

  return (
    <section className="bg-surface px-5 py-20 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <SectionHeading label="Spotlight" title="Top Products" align="center" />
      </div>

      <div ref={containerRef} className="relative mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-24 bg-gradient-to-r from-surface to-transparent md:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-24 bg-gradient-to-l from-surface to-transparent md:block" />

        <div className="overflow-x-hidden py-10">
          <motion.div className="flex" style={{ x }}>
            {loop.map((product, i) => (
              <ShowcaseCard
                key={`${product.id}-${i}`}
                product={product}
                index={i}
                x={x}
                containerWidth={containerWidth}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
