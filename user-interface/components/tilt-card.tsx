'use client'

import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'framer-motion'

export function TiltCard({
  children,
  className,
  max = 12,
  sheen = true,
}: {
  children: ReactNode
  className?: string
  max?: number
  sheen?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const px = useMotionValue(50)
  const py = useMotionValue(50)

  const sheenBg = useMotionTemplate`radial-gradient(420px circle at ${px}% ${py}%, rgba(255,255,255,0.35), transparent 45%)`

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    ry.set((x - 0.5) * max * 2)
    rx.set(-(y - 0.5) * max * 2)
    px.set(x * 100)
    py.set(y * 100)
  }

  function handleLeave() {
    rx.set(0)
    ry.set(0)
    px.set(50)
    py.set(50)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`relative ${className ?? ''}`}
    >
      {children}
      {sheen && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: sheenBg }}
        />
      )}
    </motion.div>
  )
}
