'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Trash2, Loader2, Mail, Phone, Clock, Box } from 'lucide-react'

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEnquiries = async () => {
    setLoading(true)
    const res = await adminFetch('/api/admin/enquiries')
    const data = await res.json()
    if (data.success) {
      setEnquiries(data.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return
    
    await adminFetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' })
    fetchEnquiries()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Enquiries</h1>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-card-border shadow-blue">
            <p className="text-text-secondary">No enquiries found.</p>
          </div>
        ) : (
          enquiries.map((enq) => (
            <div key={enq.id} className="bg-card rounded-2xl border border-card-border shadow-blue overflow-hidden transition-all duration-200 hover:border-primary">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 border-b border-card-border bg-surface/30">
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">{enq.customerName}</h3>
                  {enq.subject && <p className="text-sm font-medium text-text-secondary mt-1">{enq.subject}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-white px-3 py-1.5 rounded-full border border-card-border shadow-sm">
                    <Clock size={14} />
                    {new Date(enq.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(enq.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Enquiry"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6">
                  {enq.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-text-secondary" />
                      <a href={`mailto:${enq.email}`} className="text-primary hover:underline">{enq.email}</a>
                    </div>
                  )}
                  {enq.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-text-secondary" />
                      <a href={`tel:${enq.phone}`} className="text-foreground hover:text-primary">{enq.phone}</a>
                    </div>
                  )}
                  {enq.product && (
                    <div className="flex items-center gap-2 text-sm bg-accent px-3 py-1 rounded-full">
                      <Box size={14} className="text-primary" />
                      <span className="font-medium">Interested in: {enq.product.name}</span>
                    </div>
                  )}
                </div>
                <div className="bg-background rounded-xl p-5 border border-input">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{enq.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
