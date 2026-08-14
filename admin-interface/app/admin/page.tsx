'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Package, MessageSquare, Star, Tags, Loader2 } from 'lucide-react'
import type { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setStats(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) return <div>Failed to load dashboard data</div>

  const statCards = [
    { name: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Enquiries', value: stats.totalEnquiries, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Featured Products', value: stats.featuredProducts, icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Categories', value: stats.totalCategories, icon: Tags, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="flex items-center gap-4 rounded-2xl border border-card-border bg-card p-6 shadow-blue">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">{stat.name}</p>
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Recent Products */}
        <div className="rounded-3xl border border-card-border bg-card shadow-blue overflow-hidden">
          <div className="border-b border-card-border px-6 py-5">
            <h2 className="font-heading text-lg font-bold text-foreground">Recent Products</h2>
          </div>
          <div className="divide-y divide-card-border">
            {stats.recentProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-sm text-text-secondary">{p.price}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {p.status}
                </span>
              </div>
            ))}
            {stats.recentProducts.length === 0 && (
              <div className="px-6 py-8 text-center text-text-secondary">No products found</div>
            )}
          </div>
        </div>

        {/* Latest Enquiries */}
        <div className="rounded-3xl border border-card-border bg-card shadow-blue overflow-hidden">
          <div className="border-b border-card-border px-6 py-5">
            <h2 className="font-heading text-lg font-bold text-foreground">Latest Enquiries</h2>
          </div>
          <div className="divide-y divide-card-border">
            {stats.latestEnquiries.map((e) => (
              <div key={e.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{e.customerName}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-primary mt-1">{e.email}</p>
                {e.subject && <p className="text-sm text-text-secondary mt-1 line-clamp-1">{e.subject}</p>}
              </div>
            ))}
            {stats.latestEnquiries.length === 0 && (
              <div className="px-6 py-8 text-center text-text-secondary">No enquiries yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
