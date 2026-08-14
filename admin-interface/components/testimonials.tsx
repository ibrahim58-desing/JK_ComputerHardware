'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { RevealGroup, itemVariants } from '@/components/reveal'

type Testimonial = {
  id: number
  name: string
  role: string
  content: string
  rating: number
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section className="bg-background px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Reviews"
          title="Trusted by Builders Across Chennai"
          description="Don't just take our word for it. Here's what our customers have to say about our hardware and service."
          align="center"
        />
        
        <RevealGroup className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              variants={itemVariants}
              className="relative flex flex-col rounded-3xl border border-card-border bg-card p-8 shadow-blue"
            >
              {/* Star Rating */}
              <div className="flex gap-1 text-yellow-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              
              {/* Quote Content */}
              <blockquote className="mt-6 flex-1 text-base leading-relaxed text-text-secondary">
                "{t.content}"
              </blockquote>
              
              {/* User Info */}
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-foreground">{t.name}</div>
                  <div className="text-sm text-text-secondary">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
