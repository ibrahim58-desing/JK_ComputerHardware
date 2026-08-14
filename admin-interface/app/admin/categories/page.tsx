'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    const res = await adminFetch('/api/admin/categories')
    const data = await res.json()
    if (data.success) {
      setCategories(data.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      
      const data = await res.json()
      if (data.success) {
        setIsAdding(false)
        setEditingId(null)
        setName('')
        fetchCategories()
      } else {
        alert(data.error || 'Failed to save category')
      }
    } catch (err) {
      alert('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    const res = await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      fetchCategories()
    } else {
      alert(data.error || 'Failed to delete category')
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Categories</h1>
        {!isAdding && !editingId && (
          <button
            onClick={() => { setIsAdding(true); setName('') }}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Category
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-card-border bg-card shadow-blue overflow-hidden">
        {(isAdding || editingId) && (
          <div className="p-6 border-b border-card-border bg-surface/30">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Category' : 'New Category'}</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CPU Coolers"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <button
                onClick={() => { setIsAdding(false); setEditingId(null); setName('') }}
                className="px-4 py-2.5 rounded-xl border border-card-border font-medium hover:bg-surface transition-colors h-[42px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 h-[42px] min-w-[100px]"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-text-secondary border-b border-card-border">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/2">Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold text-center">Products</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="outline-2 -outline-offset-2 outline-transparent transition-all duration-200 hover:bg-surface/50 hover:outline-black">
                  <td className="px-6 py-4 font-medium text-foreground">{cat.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{cat.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-primary font-bold">
                      {cat._count.products}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id)
                          setName(cat.name)
                          setIsAdding(false)
                        }}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
