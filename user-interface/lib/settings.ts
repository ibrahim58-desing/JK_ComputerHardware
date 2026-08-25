import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export type SiteSettings = {
  contact_phone: string
  contact_email: string
  contact_address: string
  whatsapp_number: string
  working_hours: string
  instagram_url: string
  facebook_url: string
  youtube_url: string
  google_maps_url: string
}

const DEFAULTS: SiteSettings = {
  contact_phone: '',
  contact_email: '',
  contact_address: '',
  whatsapp_number: '',
  working_hours: '',
  instagram_url: '',
  facebook_url: '',
  youtube_url: '',
  google_maps_url: '',
}

// Cached per-request so every server component that needs settings can call
// this freely without hitting the database once per component.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await prisma.siteSetting.findMany()
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return { ...DEFAULTS, ...map }
})

export function whatsappHref(phone: string, message?: string): string {
  const digits = phone.replace(/[^0-9]/g, '')
  if (!digits) return '#'
  return message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/${digits}`
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^0-9+]/g, '')
  return digits ? `tel:${digits}` : '#'
}

export function mailHref(email: string): string {
  return email.trim() ? `mailto:${email.trim()}` : '#'
}
