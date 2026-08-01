'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Plus, Edit, Trash2, Loader2, Save, X, Star } from 'lucide-react'

const emptyForm = {
  name: '',
  role: '',
  content: '',
  rating: 5,
  status: 'active',
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fetchTestimonials = async () => {
    setLoading(true)
    const res = await adminFetch('/api/admin/testimonials')
    const data = await res.json()
    if (data.success) setTestimonials(data.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const startAdd = () => {
    setForm(emptyForm)
    setIsAdding(true)
    setEditingId(null)
  }

  const startEdit = (t: any) => {
    setForm({ name: t.name, role: t.role || '', content: t.content, rating: t.rating, status: t.status })
    setEditingId(t.id)
    setIsAdding(false)
  }

  const cancelForm = () => {
    setIsAdding(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/testimonials/${editingId}` : '/api/admin/testimonials'
      const method = editingId ? 'PUT' : 'POST'

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (data.success) {
        cancelForm()
        fetchTestimonials()
      } else {
        alert(data.error || 'Failed to save testimonial')
      }
    } catch (err) {
      alert('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return
    const res = await adminFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      fetchTestimonials()
    } else {
      alert(data.error || 'Failed to delete testimonial')
    }
  }

  const toggleStatus = async (t: any) => {
    const res = await adminFetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: t.status === 'active' ? 'inactive' : 'active' }),
    })
    const data = await res.json()
    if (data.success) fetchTestimonials()
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h1 className="font-heading text-3xl font-bold text-foreground">Testimonials</h1>
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Testimonial
          </button>
        )}
      </div>
      <p className="mb-8 text-sm text-text-secondary">
        Only real customer quotes — these appear publicly on the homepage under "Trusted by Builders." Set a testimonial to Inactive to hide it without deleting it.
      </p>

      <div className="rounded-2xl border border-card-border bg-card shadow-blue overflow-hidden">
        {(isAdding || editingId) && (
          <div className="p-6 border-b border-card-border bg-surface/30 space-y-4">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">Customer Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Karthik S."
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role / Context (optional)</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Gamer & Streamer"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Testimonial Text</label>
              <textarea
                rows={3}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="What did the customer actually say?"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Rating</label>
                <div className="flex items-center gap-1 rounded-xl border border-input bg-background px-3 py-2.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: n }))}
                      className="p-0.5"
                    >
                      <Star
                        size={18}
                        className={n <= form.rating ? 'text-yellow-400' : 'text-text-secondary/30'}
                        fill={n <= form.rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary h-[42px]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="ml-auto flex gap-3">
                <button
                  onClick={cancelForm}
                  className="px-4 py-2.5 rounded-xl border border-card-border font-medium hover:bg-surface transition-colors h-[42px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.content.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 h-[42px] min-w-[100px]"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </div>
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
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold w-1/2">Quote</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-text-secondary">{t.role}</p>
                  </td>
                  <td className="px-6 py-4 text-text-secondary line-clamp-2">{t.content}</td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(t)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                        t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {t.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                    No testimonials yet. Add a real customer quote to show it on the homepage.
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
