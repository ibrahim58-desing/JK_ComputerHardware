'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Loader2, Image as ImageIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toast, useToast } from '@/components/ui/toast'
import { resolveImageUrl } from '@/lib/products'

const PAGE_SIZE = 25

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const fetchProducts = async (searchValue: string, pageValue: number, signal?: AbortSignal) => {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(pageValue), limit: String(PAGE_SIZE) })
    if (searchValue) qs.set('search', searchValue)
    const res = await adminFetch(`/api/admin/products?${qs.toString()}`, { signal })
    const data = await res.json()
    if (data.success) {
      setProducts(data.data.products)
      setTotalPages(data.data.pagination.totalPages)
    }
    setLoading(false)
  }

  // Reset to page 1 whenever the search term changes, and debounce so
  // typing doesn't fire a full query on every keystroke.
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      fetchProducts(search, 1, controller.signal)
      setPage(1)
    }, 300)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [search])

  useEffect(() => {
    if (page === 1) return
    const controller = new AbortController()
    fetchProducts(search, page, controller.signal)
    return () => controller.abort()
  }, [page])

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await adminFetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('success', `"${deleteTarget.name}" was deleted.`)
        fetchProducts(search, page)
      } else {
        showToast('error', data.error || 'Failed to delete product')
      }
    } catch {
      showToast('error', 'An error occurred while deleting')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <Toast toast={toast} onClose={hideToast} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center rounded-xl border border-input bg-card px-3 py-2.5 max-w-md">
          <Search size={18} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search products..."
            className="ml-2 flex-1 bg-transparent text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-card-border bg-card shadow-blue overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-text-secondary border-b border-card-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {products.map((product) => (
                  <tr key={product.id} className="outline-2 -outline-offset-2 outline-transparent transition-all duration-200 hover:bg-surface/50 hover:outline-black">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface border border-card-border flex items-center justify-center text-text-secondary">
                          {product.image && product.image !== '/placeholder.jpg' ? (
                            <img src={resolveImageUrl(product.image)} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-text-secondary">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{product.category?.name}</td>
                    <td className="px-6 py-4 font-medium">{product.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {product.status}
                        </span>
                        {product.featured && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                            Featured
                          </span>
                        )}
                        {(!product.image || product.image === '/placeholder.jpg') && (
                          <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700" title="Products without a real photo don't show on the storefront">
                            <AlertTriangle size={12} />
                            No image — hidden
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
