'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${apiBase}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login')
      }

      // Force a hard navigation to apply layout changes and verify middleware
      window.location.href = '/admin'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-3xl shadow-blue border border-card-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-heading font-extrabold text-foreground">
            JK Admin
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Sign in to access the dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-text-secondary" />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  className="pl-10 block w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-text-secondary" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="pl-10 block w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex justify-center items-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
