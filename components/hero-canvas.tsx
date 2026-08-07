'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vy: number
  size: number
  alpha: number
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const particles: Particle[] = []

    function resize() {
      if (!canvas) return
      const parent = canvas.parentElement
      width = parent?.clientWidth ?? window.innerWidth
      height = parent?.clientHeight ?? window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function makeParticle(): Particle {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 60,
        vy: 0.3 + Math.random() * 1.1,
        size: 0.6 + Math.random() * 1.8,
        alpha: 0.2 + Math.random() * 0.6,
      }
    }

    resize()
    for (let i = 0; i < 70; i++) {
      const p = makeParticle()
      p.y = Math.random() * height
      particles.push(p)
    }

    let raf = 0
    let t = 0

    function draw() {
      if (!ctx) return
      t += 0.016
      ctx.clearRect(0, 0, width, height)

      // Particles
      for (const p of particles) {
        p.y -= p.vy
        const drift = Math.sin((p.y + t * 40) * 0.01) * 14
        const x = p.x + drift
        if (p.y < -10) Object.assign(p, makeParticle())
        ctx.beginPath()
        ctx.arc(x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  )
}
