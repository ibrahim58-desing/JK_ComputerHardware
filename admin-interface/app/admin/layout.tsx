'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Inbox,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Enquiries', href: '/admin/enquiries', icon: Inbox },
  { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoginPage) {
      adminFetch('/api/admin/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res?.success) setUser(res.data)
        })
    }
  }, [isLoginPage])

  const handleLogout = async () => {
    await adminFetch('/api/admin/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-foreground">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r border-card-border shadow-blue transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-card-border">
          <Link href="/admin" className="font-heading text-2xl font-extrabold text-primary hover:opacity-80 transition-opacity">
            JK Admin
          </Link>
          <button
            className="ml-auto lg:hidden text-text-secondary"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? 'text-primary' : 'text-text-secondary group-hover:text-foreground'}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-card-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-card-border bg-card/80 px-4 backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            className="p-2 text-text-secondary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Link href="/" target="_blank" className="text-sm font-medium text-primary hover:underline">
                View Site →
              </Link>
              <div className="h-6 w-px bg-card-border" />
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User size={16} />
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-sm font-semibold text-foreground">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-text-secondary capitalize">{user?.role || 'Administrator'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
