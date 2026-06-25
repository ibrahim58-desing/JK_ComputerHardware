'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

export function ProductBanner() {
  const [visible, setVisible] = useState(true)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="relative flex items-center justify-center gap-3 px-5 py-3 text-sm"
          style={{ backgroundColor: '#EEF4FF', color: '#0057FF' }}
        >
          <MessageCircle size={16} />
          <span className="text-center font-medium">
            💬 See something you like? WhatsApp us to check availability and get the best price!
          </span>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-blue-100"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
