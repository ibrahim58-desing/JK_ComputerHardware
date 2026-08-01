'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { RevealGroup, itemVariants } from '@/components/reveal'

interface CategorySection {
  category: { id: number; name: string }
  products: any[]
}

function CarouselSection({ section }: { section: CategorySection }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const totalProducts = section.products.length
  
  const handleNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.offsetWidth, behavior: 'smooth' })
    }
  }
  
  const handlePrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.offsetWidth, behavior: 'smooth' })
    }
  }

  return (
    <RevealGroup className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Top in <span className="text-primary">{section.category.name}</span>
        </h2>
        
        <div className="flex items-center gap-6">
          {totalProducts > 4 && (
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={handlePrev}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNext}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          
          <Link 
            href={`/products?category=${section.category.name}`}
            className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-white transition-colors"
          >
            View All
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="relative -mx-5 px-5 lg:-mx-8 lg:px-8">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 lg:gap-6 pb-6 hide-scrollbar [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {section.products.map((product) => (
            <motion.div 
              key={product.id} 
              variants={itemVariants}
              className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(25%-18px)]"
            >
              <Link 
                href={`/products/${product.id}`}
                className="group block relative overflow-hidden rounded-2xl bg-card border border-card-border p-4 transition-all hover:border-primary hover:shadow-blue-lg h-full"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-surface mb-4">
                  {product.image && product.image !== '/placeholder.jpg' ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="text-text-secondary opacity-20" size={32} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 font-heading text-lg font-bold text-primary">
                    {product.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </RevealGroup>
  )
}

export function HomepageCategorySections({ sections }: { sections: CategorySection[] }) {
  if (!sections || sections.length === 0) return null

  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-24">
        {sections.map((section) => (
          <CarouselSection key={section.category.id} section={section} />
        ))}
      </div>
    </section>
  )
}
