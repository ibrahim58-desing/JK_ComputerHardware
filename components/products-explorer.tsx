'use client'

import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ProductCard } from '@/components/product-card'
import { products, categories, brands, type Category } from '@/lib/products'
import { Filter, X, ChevronRight } from 'lucide-react'

type CategoryFilter = 'All' | Category
type PriceFilter = 'All' | 'Under ₹10k' | '₹10k - ₹30k' | 'Above ₹30k'

const priceFilters: PriceFilter[] = ['All', 'Under ₹10k', '₹10k - ₹30k', 'Above ₹30k']

export function ProductsExplorer() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')
  const [activeBrand, setActiveBrand] = useState<string>('All')
  const [activePrice, setActivePrice] = useState<PriceFilter>('All')
  const [showFilters, setShowFilters] = useState(false)

  const visible = products.filter((p) => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false
    if (activeBrand !== 'All' && p.brand !== activeBrand) return false
    if (activePrice !== 'All') {
      if (activePrice === 'Under ₹10k' && p.numericPrice >= 10000) return false
      if (activePrice === '₹10k - ₹30k' && (p.numericPrice < 10000 || p.numericPrice > 30000)) return false
      if (activePrice === 'Above ₹30k' && p.numericPrice <= 30000) return false
    }
    return true
  })

  // Reusable filter button component for the premium look
  const FilterButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
        active
          ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(0,87,255,0.3)]'
          : 'border-white/5 bg-white/5 text-text-secondary hover:border-white/10 hover:bg-white/10 hover:text-foreground'
      }`}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <motion.div
          layoutId="activeFilterGlow"
          className="absolute inset-0 z-0 rounded-xl bg-primary/20 blur-md"
        />
      )}
      <ChevronRight
        size={16}
        className={`transition-transform duration-300 ${active ? 'translate-x-1 text-white' : 'text-transparent group-hover:text-text-secondary group-hover:translate-x-0 -translate-x-2'}`}
      />
    </button>
  )

  return (
    <section className="bg-background px-5 py-14 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row gap-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-card/50 p-5 font-bold text-foreground shadow-lg backdrop-blur-xl"
          >
            <span className="flex items-center gap-3">
              <Filter size={20} className="text-primary" />
              Advanced Filters
            </span>
            {showFilters ? <X size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Sidebar Filters */}
        <motion.aside
          initial={false}
          animate={{ height: showFilters ? 'auto' : 'auto', opacity: 1 }}
          className={`${showFilters ? 'block' : 'hidden'} lg:sticky lg:top-24 h-max w-full shrink-0 lg:block lg:w-72`}
        >
          <div className="rounded-3xl border border-white/10 bg-card/30 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,87,255,0.2)]">
                <Filter size={20} />
              </div>
              <h2 className="font-heading text-lg font-bold text-foreground">Filters</h2>
            </div>

            <div className="space-y-10">
              {/* Categories */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-widest text-text-secondary">
                  <span className="h-4 w-1 rounded-full bg-primary/80"></span>
                  Category
                </h3>
                <div className="flex flex-col gap-2">
                  {['All', ...categories].map((f) => (
                    <FilterButton key={f} active={activeCategory === f} onClick={() => setActiveCategory(f as CategoryFilter)}>
                      {f}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-widest text-text-secondary">
                  <span className="h-4 w-1 rounded-full bg-primary/80"></span>
                  Brand
                </h3>
                <div className="flex flex-col gap-2">
                  {['All', ...brands].map((b) => (
                    <FilterButton key={b} active={activeBrand === b} onClick={() => setActiveBrand(b)}>
                      {b}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-widest text-text-secondary">
                  <span className="h-4 w-1 rounded-full bg-primary/80"></span>
                  Price Range
                </h3>
                <div className="flex flex-col gap-2">
                  {priceFilters.map((p) => (
                    <FilterButton key={p} active={activePrice === p} onClick={() => setActivePrice(p)}>
                      {p}
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/5 bg-card/20 px-8 py-5 backdrop-blur-md">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Showing <span className="text-primary">{visible.length}</span> Products
            </h2>
          </div>

          <LayoutGroup>
            {visible.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-card/30 p-12 text-center shadow-2xl backdrop-blur-xl relative"
              >
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6">
                   <Filter className="h-10 w-10 text-text-secondary/50" />
                </div>
                <h3 className="relative z-10 font-heading text-2xl font-bold text-foreground">No matches found</h3>
                <p className="relative z-10 mt-3 max-w-sm text-base text-text-secondary">
                  We couldn't find any hardware matching those exact filters. Try broadening your search.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('All')
                    setActiveBrand('All')
                    setActivePrice('All')
                  }}
                  className="relative z-10 mt-8 rounded-full border border-primary/50 bg-primary/10 px-8 py-3 text-sm font-bold text-primary shadow-[0_0_20px_rgba(0,87,255,0.2)] transition-all hover:bg-primary hover:text-white"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {visible.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </LayoutGroup>
        </div>
      </div>
    </section>
  )
}
