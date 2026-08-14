'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { whatsappHref } from '@/lib/settings'

export function FloatingButtons({ whatsappNumber }: { whatsappNumber: string }) {
  const [showTop, setShowTop] = useState(false)
  const [nearFooter, setNearFooter] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const observer = new IntersectionObserver(([entry]) => setNearFooter(entry.isIntersecting))
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 transition-opacity duration-300 ${
        nearFooter ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-blue-lg transition-transform hover:scale-110"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        href={whatsappHref(whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="animate-pulse-ring relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110"
        style={{ boxShadow: '0 0 22px rgba(37,211,102,0.55)' }}
      >
        <MessageCircle size={26} />
      </a>
    </div>
  )
}
