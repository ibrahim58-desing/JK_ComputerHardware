'use client'

import { motion } from 'framer-motion'

export function SectionHeading({
  label,
  title,
  description,
  align = 'center',
  underline = false,
}: {
  label?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  underline?: boolean
}) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary"
        >
          {label}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl"
      >
        {title}
      </motion.h2>
      {underline && (
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 64 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-4 h-1 rounded-full bg-primary ${align === 'center' ? 'mx-auto' : ''}`}
        />
      )}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-4 text-base leading-relaxed text-text-secondary text-pretty"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
