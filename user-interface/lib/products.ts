import {
  Cpu,
  Gpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Keyboard,
  Mouse,
  type LucideIcon,
} from 'lucide-react'

export type Category =
  | 'CPU'
  | 'GPU'
  | 'RAM'
  | 'Storage'
  | 'Monitor'
  | 'Keyboard'
  | 'Mouse'

export type BadgeTone = 'blue' | 'purple' | 'red' | 'green'

export type Product = {
  id: number
  name: string
  brand: string
  price: string
  originalPrice?: string | null
  numericPrice: number
  category: Category
  specs: string[]
  description: string
  image: string
  stock?: number
  badge?: { label: string; tone: BadgeTone }
  offer?: string | null
}

// Uploaded product photos live on backend-api's filesystem, not this app's
// own public/ dir, so Next's image optimizer — which resolves a relative
// src against its own server — can't reach them directly. Turning a
// relative /uploads/... path into the full public URL lets the optimizer
// fetch it as a remote image instead (see images.remotePatterns in
// next.config.mjs). Local assets (the placeholder, brand logos) are left
// alone since those really do live in this app's own public/ dir.
export function resolveImageUrl(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads/')) {
    const base = process.env.NEXT_PUBLIC_SITE_URL || ''
    return base ? `${base}${path}` : path
  }
  return path
}

export const categoryIcons: Record<Category, LucideIcon> = {
  CPU: Cpu,
  GPU: Gpu,
  RAM: MemoryStick,
  Storage: HardDrive,
  Monitor: Monitor,
  Keyboard: Keyboard,
  Mouse: Mouse,
}

export const categories: Category[] = [
  'CPU',
  'GPU',
  'RAM',
  'Storage',
  'Monitor',
  'Keyboard',
  'Mouse',
]

export const brands: string[] = [
  'Intel',
  'AMD',
  'NVIDIA',
  'LG',
  'Samsung',
  'Keychron',
  'Logitech',
  'Razer',
  'Corsair',
  'G.Skill',
  'Seagate',
]

export const products: Product[] = [
  {
    id: 1,
    name: 'Intel Core i9-13900K',
    brand: 'Intel',
    price: '₹42,999',
    numericPrice: 42999,
    category: 'CPU',
    specs: ['24 Cores', '5.8GHz Boost', 'LGA1700', '125W'],
    description: 'The ultimate desktop processor for gamers and creators. With 24 cores and blazing fast 5.8GHz boost clocks, this CPU crushes any workload you throw at it.',
    image: '/placeholder.jpg',
    badge: { label: 'Best Seller', tone: 'blue' },
  },
  {
    id: 2,
    name: 'AMD Ryzen 7 7700X',
    brand: 'AMD',
    price: '₹28,499',
    numericPrice: 28499,
    category: 'CPU',
    specs: ['8 Cores', '5.4GHz Boost', 'AM5 Socket', '105W'],
    description: 'Welcome to the new era of performance. The Ryzen 7 7700X features 8 high-performance cores built on the Zen 4 architecture, perfect for high-refresh-rate gaming.',
    image: '/placeholder.jpg',
    badge: { label: 'Top Pick', tone: 'purple' },
  },
  {
    id: 3,
    name: 'NVIDIA RTX 4070',
    brand: 'NVIDIA',
    price: '₹54,999',
    numericPrice: 54999,
    category: 'GPU',
    specs: ['12GB GDDR6X', 'DLSS 3', 'Ray Tracing', '200W'],
    description: 'Experience stunning visuals and AI-accelerated performance with DLSS 3. The RTX 4070 delivers incredible frame rates for 1440p gaming.',
    image: '/placeholder.jpg',
    badge: { label: 'Hot', tone: 'red' },
  },
  {
    id: 4,
    name: 'AMD Radeon RX 7600',
    brand: 'AMD',
    price: '₹24,999',
    numericPrice: 24999,
    category: 'GPU',
    specs: ['8GB GDDR6', '1080p King', 'FSR 3', '165W'],
    description: 'Unbeatable value for 1080p gaming. Featuring 8GB of GDDR6 memory and support for AMD FidelityFX Super Resolution 3.',
    image: '/placeholder.jpg',
  },
  {
    id: 5,
    name: 'LG UltraGear 27" 4K',
    brand: 'LG',
    price: '₹38,999',
    numericPrice: 38999,
    category: 'Monitor',
    specs: ['IPS', '4K 144Hz', '1ms', 'HDR600'],
    description: 'A breathtaking 4K Nano IPS display with a blistering 144Hz refresh rate and 1ms response time. Certified VESA DisplayHDR 600 for vivid colors.',
    image: '/placeholder.jpg',
    badge: { label: 'New', tone: 'green' },
  },
  {
    id: 6,
    name: 'Samsung Odyssey G5 27"',
    brand: 'Samsung',
    price: '₹22,499',
    numericPrice: 22499,
    category: 'Monitor',
    specs: ['VA Curved', '1440p', '165Hz', '1ms MPRT'],
    description: 'Immerse yourself in the action with an aggressive 1000R curve. Features a sharp 1440p resolution and fluid 165Hz gameplay.',
    image: '/placeholder.jpg',
  },
  {
    id: 7,
    name: 'Keychron K8 Pro',
    brand: 'Keychron',
    price: '₹8,499',
    numericPrice: 8499,
    category: 'Keyboard',
    specs: ['TKL', 'Hot-swap', 'Wireless', 'RGB'],
    description: 'A premium customizable mechanical keyboard. QMK/VIA support, hot-swappable switches, and excellent acoustics out of the box.',
    image: '/placeholder.jpg',
    badge: { label: 'Popular', tone: 'purple' },
  },
  {
    id: 8,
    name: 'Logitech G Pro X',
    brand: 'Logitech',
    price: '₹9,999',
    numericPrice: 9999,
    category: 'Keyboard',
    specs: ['Full Size', 'Blue Switch', 'USB-C', 'Per-key RGB'],
    description: 'Built for pros. Features swappable pro-grade switches, customizable LIGHTSYNC RGB, and a compact tenkeyless design.',
    image: '/placeholder.jpg',
  },
  {
    id: 9,
    name: 'Logitech G502 X Plus',
    brand: 'Logitech',
    price: '₹7,499',
    numericPrice: 7499,
    category: 'Mouse',
    specs: ['25,600 DPI', 'LIGHTFORCE', 'Wireless', 'RGB'],
    description: 'The iconic G502 reinvented. Featuring hybrid optical-mechanical LIGHTFORCE switches and the HERO 25K sub-micron sensor.',
    image: '/placeholder.jpg',
  },
  {
    id: 10,
    name: 'Razer DeathAdder V3',
    brand: 'Razer',
    price: '₹5,999',
    numericPrice: 5999,
    category: 'Mouse',
    specs: ['30,000 DPI', '90hr Battery', 'Ultralight'],
    description: 'Ultra-lightweight ergonomic design refined for esports. Boasts the Focus Pro 30K Optical Sensor for flawless tracking.',
    image: '/placeholder.jpg',
  },
  {
    id: 11,
    name: 'Corsair Vengeance DDR5 32GB',
    brand: 'Corsair',
    price: '₹11,999',
    numericPrice: 11999,
    category: 'RAM',
    specs: ['2x16GB', 'DDR5-5600', 'CL36', 'RGB'],
    description: 'Push the limits of performance with cutting-edge DDR5 memory, featuring brilliant ten-zone dynamic RGB lighting.',
    image: '/placeholder.jpg',
  },
  {
    id: 12,
    name: 'G.Skill Trident Z5 64GB',
    brand: 'G.Skill',
    price: '₹21,999',
    numericPrice: 21999,
    category: 'RAM',
    specs: ['2x32GB', 'DDR5-6000', 'CL30', 'RGB'],
    description: 'Flagship dual-channel DDR5 memory designed for extreme performance and stunning aesthetics for the most high-end builds.',
    image: '/placeholder.jpg',
  },
  {
    id: 13,
    name: 'Samsung 990 Pro 1TB NVMe',
    brand: 'Samsung',
    price: '₹8,999',
    numericPrice: 8999,
    category: 'Storage',
    specs: ['PCIe 4.0', '7450MB/s Read', 'M.2', '5yr'],
    description: 'The ultimate SSD for gamers and professionals. Delivers blistering sequential read/write speeds up to 7450/6900 MB/s.',
    image: '/placeholder.jpg',
  },
  {
    id: 14,
    name: 'Seagate Barracuda 2TB HDD',
    brand: 'Seagate',
    price: '₹3,999',
    numericPrice: 3999,
    category: 'Storage',
    specs: ['7200RPM', 'SATA III', '256MB Cache'],
    description: 'Reliable high-capacity mass storage for your game library and media files. Features a 7200RPM spindle speed for fast load times.',
    image: '/placeholder.jpg',
  },
]

export const badgeClasses: Record<BadgeTone, string> = {
  blue: 'bg-primary/10 text-primary',
  purple: 'bg-[#6c2fff]/10 text-[#6c2fff]',
  red: 'bg-red-500/10 text-red-600',
  green: 'bg-emerald-500/10 text-emerald-600',
}
