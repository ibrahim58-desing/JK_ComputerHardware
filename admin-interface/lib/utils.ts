import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Derives the filterable numeric price from an admin-entered display price
// (e.g. "₹42,999" -> 42999). Single source of truth so display and filter
// price can never drift apart.
export function parsePriceToNumber(price: string): number {
  const digitsOnly = price.replace(/[^0-9.]/g, '')
  const value = parseFloat(digitsOnly)
  return Number.isFinite(value) ? value : 0
}
