'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type GalleryImage = { url: string; alt: string }

export function ProductGallery({
  images,
  icon,
  badge,
  badgeClassName,
}: {
  images: GalleryImage[]
  icon: ReactNode
  badge?: { label: string } | null
  badgeClassName?: string
}) {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const count = images.length

  const goPrev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count])
  const goNext = useCallback(() => setIndex((i) => (i + 1) % count), [count])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, goPrev, goNext])

  const current = images[index]

  return (
    <div className="flex flex-col gap-4">
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-card-border bg-surface p-12"
        onDoubleClick={() => setLightboxOpen(true)}
      >
        <div className="absolute left-6 top-6 z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        {badge && (
          <span
            className={`absolute right-6 top-6 z-10 rounded-full px-4 py-1.5 font-mono text-sm font-semibold uppercase tracking-wide ${badgeClassName ?? ''}`}
          >
            {badge.label}
          </span>
        )}
        <div className="relative z-0 h-full max-h-sm w-full max-w-sm opacity-90 mix-blend-multiply">
          <Image
            src={current.url}
            alt={current.alt}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-transform hover:scale-110"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-transform hover:scale-110"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-surface transition-colors ${
                i === index ? 'border-primary' : 'border-card-border hover:border-primary/50'
              }`}
            >
              <Image src={img.url} alt={img.alt} fill className="object-contain mix-blend-multiply p-2" sizes="25vw" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X size={24} />
          </button>

          <div className="relative h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.url} alt={current.alt} fill className="object-contain" sizes="100vw" />
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
