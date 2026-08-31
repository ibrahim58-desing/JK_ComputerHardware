'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Save, Loader2, Home, Star, Search, X, ArrowUp, ArrowDown, ImageIcon, Phone, Lock, CheckCircle2 } from 'lucide-react'
import { resolveImageUrl } from '@/lib/products'

const MAX_TOP_PRODUCTS = 10

const CONTACT_DEFAULTS = {
  contact_phone: '',
  whatsapp_number: '',
  contact_email: '',
  contact_address: '',
  working_hours: '',
  google_maps_url: '',
  instagram_url: '',
  facebook_url: '',
  youtube_url: '',
}

const CONTACT_FIELDS: { key: keyof typeof CONTACT_DEFAULTS; label: string; placeholder: string }[] = [
  { key: 'contact_phone', label: 'Phone Number', placeholder: 'e.g. +91 98765 43210' },
  { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: 'e.g. +91 98765 43210' },
  { key: 'contact_email', label: 'Email Address', placeholder: 'e.g. hello@jkinfosystem.com' },
  { key: 'contact_address', label: 'Store Address', placeholder: 'e.g. 12 Anna Salai, Chennai' },
  { key: 'working_hours', label: 'Working Hours', placeholder: 'e.g. Mon–Sat, 10am–8pm' },
  { key: 'google_maps_url', label: 'Google Maps Link', placeholder: 'https://maps.google.com/...' },
  { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
  { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  // Products the picker knows about — hydrated on demand (selected chips by
  // id, search results by query) instead of preloading the whole catalog.
  const [productCache, setProductCache] = useState<Map<string, any>>(new Map())
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  // Settings state
  const [homepageCategories, setHomepageCategories] = useState<string[]>([])
  const [topProducts, setTopProducts] = useState<string[]>([])
  const [contactInfo, setContactInfo] = useState({ ...CONTACT_DEFAULTS })

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin/categories').then(r => r.json()),
      adminFetch('/api/admin/settings').then(r => r.json()),
    ]).then(([catsRes, settingsRes]) => {
      if (catsRes.success) {
        setCategories(catsRes.data)
      }
      if (settingsRes.success) {
        if (settingsRes.data.homepage_categories) {
          try {
            setHomepageCategories(JSON.parse(settingsRes.data.homepage_categories))
          } catch (e) {
            setHomepageCategories([])
          }
        }
        if (settingsRes.data.top_products) {
          try {
            setTopProducts(JSON.parse(settingsRes.data.top_products))
          } catch (e) {
            setTopProducts([])
          }
        }
        setContactInfo((prev) => {
          const next = { ...prev }
          for (const key of Object.keys(CONTACT_DEFAULTS) as (keyof typeof CONTACT_DEFAULTS)[]) {
            if (settingsRes.data[key]) next[key] = settingsRes.data[key]
          }
          return next
        })
      }
      setLoading(false)
    })
  }, [])

  // Hydrate the "Selected" chips by id once the saved top_products list is
  // known — bounded to at most MAX_TOP_PRODUCTS ids, never the full catalog.
  useEffect(() => {
    const missing = topProducts.filter((id) => !productCache.has(id))
    if (missing.length === 0) return
    adminFetch(`/api/admin/products?ids=${missing.join(',')}&limit=${missing.length}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProductCache((prev) => {
            const next = new Map(prev)
            for (const p of data.data.products) next.set(p.id.toString(), p)
            return next
          })
        }
      })
      .catch(() => {})
  }, [topProducts])

  // Debounced server-side search for the "add a product" list — replaces
  // preloading every active product just to filter it in the browser.
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      setSearchLoading(true)
      const qs = new URLSearchParams({ status: 'active', limit: '20' })
      if (productSearch.trim()) qs.set('search', productSearch.trim())
      adminFetch(`/api/admin/products?${qs.toString()}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setSearchResults(data.data.products)
            setProductCache((prev) => {
              const next = new Map(prev)
              for (const p of data.data.products) next.set(p.id.toString(), p)
              return next
            })
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') console.error('Failed to search products', err)
        })
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [productSearch])

  const handleTopProductToggle = (idStr: string) => {
    setTopProducts((prev) => {
      if (prev.includes(idStr)) {
        return prev.filter((id) => id !== idStr)
      }
      if (prev.length >= MAX_TOP_PRODUCTS) {
        alert(`You can select a maximum of ${MAX_TOP_PRODUCTS} top products.`)
        return prev
      }
      return [...prev, idStr]
    })
  }

  const moveTopProduct = (index: number, direction: -1 | 1) => {
    setTopProducts((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleCategoryToggle = (id: string) => {
    setHomepageCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id)
      } else {
        if (prev.length >= 3) {
          alert('You can select a maximum of 3 categories for the homepage.')
          return prev
        }
        return [...prev, id]
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        homepage_categories: JSON.stringify(homepageCategories),
        top_products: JSON.stringify(topProducts),
        ...contactInfo,
      }
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (e) {
      alert('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setPasswordSaving(true)
    try {
      const res = await adminFetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch (e) {
      setPasswordError('An error occurred while changing the password')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Site Settings</h1>
        <p className="mt-2 text-text-secondary">Manage global configurations for the website.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Phone size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Contact Information</h2>
              <p className="text-sm text-text-secondary">
                Used across the whole site — footer, WhatsApp buttons, the Contact page, and Call/Directions links.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {CONTACT_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                <input
                  type="text"
                  value={contactInfo[field.key]}
                  onChange={(e) => setContactInfo((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Home size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Homepage Categories</h2>
              <p className="text-sm text-text-secondary">Select up to 3 categories to display prominently on the homepage.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => {
              const idStr = c.id.toString()
              const isSelected = homepageCategories.includes(idStr)
              
              return (
                <label 
                  key={c.id} 
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5'
                      : 'border-card-border hover:border-primary/50 hover:bg-surface'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(idStr)}
                  />
                  <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {c.name}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Star size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Top Products Showcase</h2>
              <p className="text-sm text-text-secondary">
                Pick up to {MAX_TOP_PRODUCTS} products for the auto-scrolling showcase above the homepage category sections. Order matters — first picked scrolls first.
              </p>
            </div>
          </div>

          {topProducts.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-text-secondary">
                Selected ({topProducts.length}/{MAX_TOP_PRODUCTS})
              </h3>
              <div className="space-y-2">
                {topProducts.map((idStr, index) => {
                  const product = productCache.get(idStr)
                  if (!product) return null
                  return (
                    <div
                      key={idStr}
                      className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface border border-card-border flex items-center justify-center text-text-secondary">
                        {product.image && product.image !== '/placeholder.jpg' ? (
                          <img src={resolveImageUrl(product.image)} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-foreground text-sm">{product.name}</p>
                        <p className="text-xs text-text-secondary">{product.price}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveTopProduct(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTopProduct(index, 1)}
                          disabled={index === topProducts.length - 1}
                          className="p-1.5 rounded-lg hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTopProductToggle(idStr)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-text-secondary">All Products</h3>
            <div className="flex items-center rounded-xl border border-input bg-background px-3 py-2.5 mb-3">
              <Search size={16} className="text-text-secondary" />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                className="ml-2 flex-1 bg-transparent text-sm outline-none"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {searchResults.map((product) => {
                const idStr = product.id.toString()
                const isSelected = topProducts.includes(idStr)
                return (
                  <label
                    key={product.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-card-border hover:border-primary/50 hover:bg-surface'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-primary"
                      checked={isSelected}
                      onChange={() => handleTopProductToggle(idStr)}
                    />
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface border border-card-border flex items-center justify-center text-text-secondary">
                      {product.image && product.image !== '/placeholder.jpg' ? (
                        <img src={resolveImageUrl(product.image)} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground text-sm">{product.name}</p>
                      <p className="text-xs text-text-secondary">{product.brand} · {product.price}</p>
                    </div>
                  </label>
                )
              })}
              {!searchLoading && searchResults.length === 0 && (
                <p className="text-center text-sm text-text-secondary py-6">No products found.</p>
              )}
              {searchLoading && (
                <p className="text-center text-sm text-text-secondary py-6">Searching…</p>
              )}
            </div>
            <p className="mt-2 text-xs text-text-secondary">Showing the top 20 matches — refine your search to narrow the list.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Settings
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-card-border p-6 shadow-blue space-y-6">
          <div className="flex items-center gap-3 border-b border-card-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Change Password</h2>
              <p className="text-sm text-text-secondary">Update your admin login password.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={16} />
              Password updated successfully.
            </p>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {passwordSaving ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
