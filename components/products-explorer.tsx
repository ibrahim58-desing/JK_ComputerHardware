'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ProductCard } from '@/components/product-card'
import { type Product } from '@/lib/products'
import { Filter, X, SlidersHorizontal, Tag, Banknote, Layers } from 'lucide-react'

type PriceFilter = 'All' | 'Under ₹10k' | '₹10k - ₹30k' | 'Above ₹30k'

const priceFilters: PriceFilter[] = ['All', 'Under ₹10k', '₹10k - ₹30k', 'Above ₹30k']

export function ProductsExplorer({ initialProducts }: { initialProducts: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [activeBrand, setActiveBrand] = useState<string>('All')
  const [activePrice, setActivePrice] = useState<PriceFilter>('All')

  // Derive categories and brands dynamically from actual products
  const dynamicCategories = useMemo(() => {
    const cats = [...new Set(initialProducts.map(p => p.category))]
    return cats.sort()
  }, [initialProducts])

  const dynamicBrands = useMemo(() => {
    const brs = [...new Set(initialProducts.map(p => p.brand).filter(Boolean))]
    return brs.sort()
  }, [initialProducts])

  const visible = initialProducts.filter((p) => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false
    if (activeBrand !== 'All' && p.brand !== activeBrand) return false
    if (activePrice !== 'All') {
      if (activePrice === 'Under ₹10k' && p.numericPrice >= 10000) return false
      if (activePrice === '₹10k - ₹30k' && (p.numericPrice < 10000 || p.numericPrice > 30000)) return false
      if (activePrice === 'Above ₹30k' && p.numericPrice <= 30000) return false
    }
    return true
  })

  const hasActiveFilters = activeCategory !== 'All' || activeBrand !== 'All' || activePrice !== 'All'

  const clearAllFilters = () => {
    setActiveCategory('All')
    setActiveBrand('All')
    setActivePrice('All')
  }

  return (
    <section className="bg-background px-5 py-14 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row gap-10">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-card/50 p-5 font-bold text-foreground shadow-lg backdrop-blur-xl">
            <span className="flex items-center gap-3">
              <Filter size={20} className="text-primary" />
              Advanced Filters
            </span>
          </div>
        </div>

        {/* Sidebar Filters */}
        <aside className="hidden lg:block lg:w-72 shrink-0 h-max sticky top-24">
          <div className="rounded-3xl border border-white/10 bg-card/30 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,87,255,0.2)]">
                  <SlidersHorizontal size={20} />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground">Filters</h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                  title="Clear all filters"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="space-y-8">
              {/* Categories */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
                  <Layers size={14} className="text-primary/60" />
                  Category
                </h3>
                <div className="flex flex-col gap-2">
                  {['All', ...dynamicCategories].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveCategory(f)}
                      className={`text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        activeCategory === f
                          ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,87,255,0.35)]'
                          : 'bg-white/5 border border-transparent text-text-secondary hover:bg-white/10 hover:text-foreground hover:border-white/10'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
                  <Tag size={14} className="text-primary/60" />
                  Brand
                </h3>
                <div className="flex flex-col gap-2">
                  {['All', ...dynamicBrands].map((b) => (
                    <button
                      key={b}
                      onClick={() => setActiveBrand(b)}
                      className={`text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        activeBrand === b
                          ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,87,255,0.35)]'
                          : 'bg-white/5 border border-transparent text-text-secondary hover:bg-white/10 hover:text-foreground hover:border-white/10'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
                  <Banknote size={14} className="text-primary/60" />
                  Price Range
                </h3>
                <div className="flex flex-col gap-2">
                  {priceFilters.map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePrice(p)}
                      className={`text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        activePrice === p
                          ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,87,255,0.35)]'
                          : 'bg-white/5 border border-transparent text-text-secondary hover:bg-white/10 hover:text-foreground hover:border-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/5 bg-card/20 px-8 py-5 backdrop-blur-md">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Showing <span className="text-primary">{visible.length}</span> Products
            </h2>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Filter size={14} className="text-primary" />
                Filtered
              </div>
            )}
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
                  onClick={clearAllFilters}
                  className="relative z-10 mt-8 rounded-full border border-primary/50 bg-primary/10 px-8 py-3 text-sm font-bold text-primary shadow-[0_0_20px_rgba(0,87,255,0.2)] transition-all hover:bg-primary hover:text-white"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
