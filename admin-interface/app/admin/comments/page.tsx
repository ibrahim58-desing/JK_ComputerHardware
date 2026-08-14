'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Loader2, Trash2, EyeOff, Eye, MessageSquare } from 'lucide-react'

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = async () => {
    setLoading(true)
    const res = await adminFetch('/api/admin/comments')
    const data = await res.json()
    if (data.success) setComments(data.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const toggleStatus = async (c: any) => {
    const res = await adminFetch(`/api/admin/comments/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: c.status === 'active' ? 'hidden' : 'active' }),
    })
    const data = await res.json()
    if (data.success) fetchComments()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this comment?')) return
    const res = await adminFetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) fetchComments()
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-foreground">Comments</h1>
      <p className="mt-2 mb-8 text-sm text-text-secondary">
        Visitor comments submitted on the homepage. Hide or delete anything spammy, offensive, or otherwise unwanted — hidden comments stop showing publicly but stay here so you can restore them.
      </p>

      <div className="rounded-2xl border border-card-border bg-card shadow-blue overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center text-text-secondary">
            <MessageSquare size={32} className="opacity-30" />
            No comments yet.
          </div>
        ) : (
          <ul className="divide-y divide-card-border">
            {comments.map((c) => (
              <li key={c.id} className="flex items-start gap-4 p-5 outline-2 -outline-offset-2 outline-transparent transition-all duration-200 hover:bg-surface/50 hover:outline-black">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <span className="text-xs text-text-secondary">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {c.status === 'hidden' && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-700">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary break-words">{c.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleStatus(c)}
                    className="p-2 text-text-secondary hover:bg-surface rounded-lg transition-colors"
                    title={c.status === 'active' ? 'Hide from homepage' : 'Show on homepage'}
                  >
                    {c.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
