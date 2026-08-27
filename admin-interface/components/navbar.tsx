'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Search, MessageCircle } from 'lucide-react'

type SearchSuggestion = {
  id: number
  name: string
  price: string
  image: string
  category: string
}

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
]

// Top-level pages that open on a dark hero — the navbar should start
// transparent/white on these and only flip to solid/dark once scrolled.
// Nested routes (e.g. /products/123) aren't included since they don't have
// a dark hero at the top.
const DARK_HERO_ROUTES = ['/', '/products', '/about', '/services', '/contact', '/privacy']

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
    setSearchQuery('')
  }, [pathname])

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced, server-side search suggestions — only queries once the user
  // has actually typed something, instead of preloading the whole catalog
  // on every page mount.
  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSuggestions(data.data.map((p: any) => ({
              ...p,
              category: p.category?.name || 'Hardware',
            })))
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') console.error('Failed to fetch search suggestions', err)
        })
    }, 250)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [searchQuery])

  const onDarkHero = DARK_HERO_ROUTES.includes(pathname) && !scrolled

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-background/90 backdrop-blur-2xl border-b border-primary/15 shadow-blue'
          : 'bg-transparent border-b border-transparent'
        }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="JK Infosystem home">
          <Image
            src={onDarkHero ? '/brand/jk-logo-white.png' : '/brand/jk-logo-dark.png'}
            alt="JK Infosystem"
            width={140}
            height={122}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`group relative text-sm font-medium transition-colors ${active
                      ? (onDarkHero ? 'text-white' : 'text-primary')
                      : (onDarkHero ? 'text-white/80 hover:text-white' : 'text-foreground hover:text-primary')
                    }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'
                      } ${onDarkHero ? 'bg-white' : 'bg-primary'}`}
                    style={{ boxShadow: onDarkHero ? '0 0 8px rgba(255,255,255,0.4)' : '0 0 8px rgba(0,0,0,0.2)' }}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {/* Search Bar */}
          <div ref={searchRef} className="relative">
            <div
              className={`flex items-center rounded-full border px-3 py-1.5 transition-all duration-300 ${
                onDarkHero
                  ? 'border-white/30 bg-white/10 text-white placeholder:text-white/50'
                  : 'border-card-border bg-white text-foreground shadow-sm'
              } ${searchOpen ? 'w-52' : 'w-40'}`}
            >
              <Search size={14} className={`shrink-0 ${onDarkHero ? 'text-white/60' : 'text-text-secondary'}`} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-inherit/50"
              />
            </div>
            <AnimatePresence>
              {searchOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-card-border bg-card shadow-blue-lg"
                >
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Search size={14} />
                      </span>
                      <div>
                        <p className="font-medium text-card-foreground">{p.name}</p>
                        <p className="text-xs text-text-secondary">{p.category} · {p.price}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>


        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className={`rounded-lg p-2 md:hidden ${onDarkHero ? 'text-white' : 'text-foreground'
            }`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-primary/15 bg-background/95 backdrop-blur-2xl md:hidden"
          >
            <div className="px-5 py-3">
              <div className="flex items-center rounded-xl border border-primary/20 bg-surface px-3 py-2.5">
                <Search size={16} className="shrink-0 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSearchOpen(true)
                  }}
                  className="ml-2 w-full bg-transparent text-sm outline-none"
                />
              </div>
              {searchQuery.trim().length > 0 && suggestions.length > 0 && (
                <div className="mt-2 rounded-xl border border-card-border bg-card shadow-blue">
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="font-medium text-card-foreground">{p.name}</span>
                      <span className="ml-auto text-xs text-text-secondary">{p.price}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <ul className="flex flex-col gap-1 px-5 py-2 pb-4">
              {links.map((l) => {
                const active = pathname === l.href
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${active
                          ? 'bg-accent text-primary'
                          : 'text-foreground hover:bg-accent hover:text-primary'
                        }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
