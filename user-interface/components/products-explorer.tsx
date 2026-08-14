'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ProductCard } from '@/components/product-card'
import { type Product } from '@/lib/products'
import { Filter, X, SlidersHorizontal, Tag, Banknote, Layers, ChevronDown } from 'lucide-react'

type PriceFilter = 'All' | 'Under ₹10k' | '₹10k - ₹30k' | 'Above ₹30k'

const priceFilters: PriceFilter[] = ['All', 'Under ₹10k', '₹10k - ₹30k', 'Above ₹30k']

function matchesPrice(price: number, filter: PriceFilter): boolean {
  if (filter === 'All') return true
  if (filter === 'Under ₹10k') return price < 10000
  if (filter === '₹10k - ₹30k') return price >= 10000 && price <= 30000
  return price > 30000
}

function FilterOption({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-primary text-primary-foreground shadow-blue'
          : 'border border-transparent bg-surface text-text-secondary hover:border-card-border hover:bg-accent hover:text-foreground'
      }`}
    >
      <span>{label}</span>
      <span className={`text-xs font-mono ${active ? 'text-primary-foreground/70' : 'text-text-secondary/70'}`}>
        {count}
      </span>
    </button>
  )
}

export function ProductsExplorer({
  initialProducts,
  whatsappNumber = '',
  initialCategory,
  initialBrand,
}: {
  initialProducts: Product[]
  whatsappNumber?: string
  initialCategory?: string
  initialBrand?: string
}) {
  const router = useRouter()

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'All')
  const [activeBrand, setActiveBrand] = useState<string>(initialBrand || 'All')
  const [activePrice, setActivePrice] = useState<PriceFilter>('All')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const isFirstRun = useRef(true)

  // Derive categories and brands dynamically from actual products
  const dynamicCategories = useMemo(() => {
    const cats = [...new Set(initialProducts.map((p) => p.category))]
    return cats.sort()
  }, [initialProducts])

  const dynamicBrands = useMemo(() => {
    const brs = [...new Set(initialProducts.map((p) => p.brand).filter(Boolean))]
    return brs.sort()
  }, [initialProducts])

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of initialProducts) map.set(p.category, (map.get(p.category) || 0) + 1)
    return map
  }, [initialProducts])

  const brandCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of initialProducts) {
      if (!p.brand) continue
      map.set(p.brand, (map.get(p.brand) || 0) + 1)
    }
    return map
  }, [initialProducts])

  const priceCounts = useMemo(() => {
    const map = new Map<PriceFilter, number>()
    for (const f of priceFilters) {
      map.set(f, initialProducts.filter((p) => matchesPrice(p.numericPrice, f)).length)
    }
    return map
  }, [initialProducts])

  const visible = initialProducts.filter((p) => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false
    if (activeBrand !== 'All' && p.brand !== activeBrand) return false
    if (!matchesPrice(p.numericPrice, activePrice)) return false
    return true
  })

  const hasActiveFilters = activeCategory !== 'All' || activeBrand !== 'All' || activePrice !== 'All'

  const clearAllFilters = () => {
    setActiveCategory('All')
    setActiveBrand('All')
    setActivePrice('All')
  }

  // Keep the URL in sync so filtered views are shareable/bookmarkable and
  // links like "Shop CPU" elsewhere on the site land pre-filtered.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    const params = new URLSearchParams()
    if (activeCategory !== 'All') params.set('category', activeCategory)
    if (activeBrand !== 'All') params.set('brand', activeBrand)
    const qs = params.toString()
    router.replace(qs ? `/products?${qs}` : '/products', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeBrand])

  const filterSections = (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
          <Layers size={14} className="text-primary/60" />
          Category
        </h3>
        <div className="flex flex-col gap-2">
          <FilterOption
            label="All"
            count={initialProducts.length}
            active={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
          />
          {dynamicCategories.map((f) => (
            <FilterOption
              key={f}
              label={f}
              count={categoryCounts.get(f) || 0}
              active={activeCategory === f}
              onClick={() => setActiveCategory(f)}
            />
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
          <FilterOption
            label="All"
            count={initialProducts.length}
            active={activeBrand === 'All'}
            onClick={() => setActiveBrand('All')}
          />
          {dynamicBrands.map((b) => (
            <FilterOption
              key={b}
              label={b}
              count={brandCounts.get(b) || 0}
              active={activeBrand === b}
              onClick={() => setActiveBrand(b)}
            />
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
            <FilterOption
              key={p}
              label={p}
              count={priceCounts.get(p) || 0}
              active={activePrice === p}
              onClick={() => setActivePrice(p)}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <section className="bg-background px-5 py-14 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row gap-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-card-border bg-card p-5 font-bold text-foreground shadow-blue"
          >
            <span className="flex items-center gap-3">
              <Filter size={20} className="text-primary" />
              Filters
              {hasActiveFilters && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {[activeCategory, activeBrand, activePrice].filter((v) => v !== 'All').length}
                </span>
              )}
            </span>
            <ChevronDown size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card p-6 shadow-blue-lg lg:hidden"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text-secondary"
                  >
                    <X size={18} />
                  </button>
                </div>
                {filterSections}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
                >
                  Show {visible.length} Results
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sidebar Filters */}
        <aside className="hidden lg:block lg:w-72 shrink-0 h-max sticky top-24">
          <div className="rounded-3xl border border-card-border bg-card p-6 shadow-blue">
            <div className="flex items-center justify-between mb-8 border-b border-card-border pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SlidersHorizontal size={20} />
                </div>
                <h2 className="font-heading text-lg font-bold text-foreground">Filters</h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                  title="Clear all filters"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {filterSections}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between rounded-3xl border border-card-border bg-card px-8 py-5 shadow-blue">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Showing <span className="text-primary">{visible.length}</span> Products
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-60"
              >
                <Filter size={14} />
                Clear filters
              </button>
            )}
          </div>

          <LayoutGroup>
            {visible.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-card-border bg-card p-12 text-center shadow-blue relative"
              >
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-surface border border-card-border mb-6">
                  <Filter className="h-10 w-10 text-text-secondary/50" />
                </div>
                <h3 className="relative z-10 font-heading text-2xl font-bold text-foreground">No matches found</h3>
                <p className="relative z-10 mt-3 max-w-sm text-base text-text-secondary">
                  We couldn't find any hardware matching those exact filters. Try broadening your search.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="relative z-10 mt-8 rounded-full border border-primary/50 bg-primary/10 px-8 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
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
                      <ProductCard product={p} whatsappNumber={whatsappNumber} />
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
