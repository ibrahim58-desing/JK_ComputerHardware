'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { RevealGroup } from '@/components/reveal'
import { ProductCard } from '@/components/product-card'

interface CategorySection {
  category: { id: number; name: string }
  products: any[]
}

// Widest a single card ever gets is ~1/4 of the strip (lg breakpoint), so at
// most ~4 cards are visible at once regardless of screen size (the section
// is capped at max-w-[1400px]). Copy count is derived from that so short
// categories still get real scroll buffer on both sides of the wrap
// threshold — with a flat "3 copies", a category with only 2-3 products
// could have its native scroll limit land *before* the loop threshold,
// so the strip would just dead-end instead of wrapping.
const MAX_VISIBLE_CARDS = 4

function CarouselSection({ section, whatsappNumber }: { section: CategorySection; whatsappNumber: string }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const oneSetWidthRef = useRef(0)
  const totalProducts = section.products.length
  const loop = totalProducts > 1
  const copies = loop ? Math.max(3, Math.ceil((MAX_VISIBLE_CARDS * 2) / totalProducts) + 2) : 1
  const mid = Math.floor(copies / 2)

  const displayProducts = loop
    ? Array.from({ length: copies }, () => section.products).flat()
    : section.products

  // Measure one set's width and start the scroller in the middle copy so
  // swiping past either edge always has more content to land on.
  useEffect(() => {
    if (!loop) return
    const el = scrollContainerRef.current
    if (!el) return
    const setup = () => {
      const width = el.scrollWidth / copies
      oneSetWidthRef.current = width
      el.scrollLeft = width * mid
    }
    setup()
    window.addEventListener('resize', setup)
    return () => window.removeEventListener('resize', setup)
  }, [loop, totalProducts, copies, mid])

  // Once the user scrolls/swipes out of the middle copy, jump back by one
  // set width so it looks like the strip never ends.
  useEffect(() => {
    if (!loop) return
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => {
      const oneSetWidth = oneSetWidthRef.current
      if (!oneSetWidth) return
      const lowBound = (mid - 1) * oneSetWidth
      const highBound = (mid + 1) * oneSetWidth
      if (el.scrollLeft <= lowBound) {
        el.scrollLeft += oneSetWidth
      } else if (el.scrollLeft >= highBound) {
        el.scrollLeft -= oneSetWidth
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [loop, mid])

  // Step by a single card's width (+ gap) instead of the whole visible
  // width — jumping ~4 cards per click in one "smooth" scroll felt abrupt.
  const scrollByOneCard = (direction: 1 | -1) => {
    const el = scrollContainerRef.current
    const firstItem = el?.firstElementChild as HTMLElement | null
    if (!el || !firstItem) return
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    const step = firstItem.getBoundingClientRect().width + gap
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  const handleNext = () => scrollByOneCard(1)
  const handlePrev = () => scrollByOneCard(-1)

  return (
    <RevealGroup className="space-y-8">
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Top in <span className="text-primary">{section.category.name}</span>
        </h2>

        <Link
          href={`/products?category=${section.category.name}`}
          className="group flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-60"
        >
          View All
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="relative -mx-5 px-5 lg:-mx-8 lg:px-8">
        {loop && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card-border bg-card text-text-secondary shadow-blue-lg transition-all hover:border-primary hover:bg-primary hover:text-white md:flex lg:left-4"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card-border bg-card text-text-secondary shadow-blue-lg transition-all hover:border-primary hover:bg-primary hover:text-white md:flex lg:right-4"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 lg:gap-6 pb-6 hide-scrollbar [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayProducts.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(25%-18px)]"
            >
              <ProductCard product={product} whatsappNumber={whatsappNumber} />
            </div>
          ))}
        </div>
      </div>
    </RevealGroup>
  )
}

export function HomepageCategorySections({
  sections,
  whatsappNumber = '',
}: {
  sections: CategorySection[]
  whatsappNumber?: string
}) {
  if (!sections || sections.length === 0) return null

  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-24">
        {sections.map((section) => (
          <CarouselSection key={section.category.id} section={section} whatsappNumber={whatsappNumber} />
        ))}
      </div>
    </section>
  )
}
