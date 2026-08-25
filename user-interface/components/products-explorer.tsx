'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ProductCard } from '@/components/product-card'
import { type Product } from '@/lib/products'
import {
  Filter,
  X,
  SlidersHorizontal,
  Tag,
  Banknote,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type PriceFilter = 'All' | 'Under ₹10k' | '₹10k - ₹30k' | 'Above ₹30k'

const priceFilters: PriceFilter[] = ['All', 'Under ₹10k', '₹10k - ₹30k', 'Above ₹30k']

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
  products,
  whatsappNumber = '',
  activeCategory,
  activeBrand,
  activePrice,
  categories,
  brands,
  priceCounts,
  pagination,
}: {
  products: Product[]
  whatsappNumber?: string
  activeCategory: string
  activeBrand: string
  activePrice: PriceFilter
  categories: { name: string; count: number }[]
  brands: { name: string; count: number }[]
  priceCounts: Record<PriceFilter, number>
  pagination: { page: number; pageSize: number; totalCount: number; totalPages: number }
}) {
  const router = useRouter()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const hasActiveFilters = activeCategory !== 'All' || activeBrand !== 'All' || activePrice !== 'All'

  // Navigating to a new URL re-runs the server query with the new filters —
  // that's the source of truth now, not local state, so pagination and
  // facet counts stay correct at catalog scale.
  function navigate(next: { category?: string; brand?: string; price?: PriceFilter; page?: number }) {
    const params = new URLSearchParams()
    const category = next.category ?? activeCategory
    const brand = next.brand ?? activeBrand
    const price = next.price ?? activePrice
    const page = next.page ?? 1

    if (category !== 'All') params.set('category', category)
    if (brand !== 'All') params.set('brand', brand)
    if (price !== 'All') params.set('price', price)
    if (page > 1) params.set('page', String(page))

    const qs = params.toString()
    router.push(qs ? `/products?${qs}` : '/products')
    setMobileFiltersOpen(false)
  }

  const clearAllFilters = () => navigate({ category: 'All', brand: 'All', price: 'All', page: 1 })

  const rangeStart = pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const rangeEnd = Math.min(pagination.page * pagination.pageSize, pagination.totalCount)

  const filterSections = (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
          <Layers size={14} className="text-primary/60" />
          Category
        </h3>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          <FilterOption
            label="All"
            count={priceCounts.All}
            active={activeCategory === 'All'}
            onClick={() => navigate({ category: 'All', page: 1 })}
          />
          {categories.map((c) => (
            <FilterOption
              key={c.name}
              label={c.name}
              count={c.count}
              active={activeCategory === c.name}
              onClick={() => navigate({ category: c.name, page: 1 })}
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
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          <FilterOption
            label="All"
            count={priceCounts.All}
            active={activeBrand === 'All'}
            onClick={() => navigate({ brand: 'All', page: 1 })}
          />
          {brands.map((b) => (
            <FilterOption
              key={b.name}
              label={b.name}
              count={b.count}
              active={activeBrand === b.name}
              onClick={() => navigate({ brand: b.name, page: 1 })}
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
              count={priceCounts[p] || 0}
              active={activePrice === p}
              onClick={() => navigate({ price: p, page: 1 })}
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
              Showing <span className="text-primary">{rangeStart}-{rangeEnd}</span> of{' '}
              <span className="text-primary">{pagination.totalCount}</span> Products
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
            {products.length === 0 ? (
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
                  {products.map((p) => (
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => navigate({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-card text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 text-sm font-semibold text-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => navigate({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-card text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
