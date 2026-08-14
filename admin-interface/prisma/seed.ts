import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ─── Seed Admin ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 12)
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: 'admin',
    },
  })
  console.log('✅ Admin user created — change the seeded password immediately after first login')

  // ─── Seed Categories ────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'CPU', slug: 'cpu' },
    { name: 'GPU', slug: 'gpu' },
    { name: 'RAM', slug: 'ram' },
    { name: 'Storage', slug: 'storage' },
    { name: 'Monitor', slug: 'monitor' },
    { name: 'Keyboard', slug: 'keyboard' },
    { name: 'Mouse', slug: 'mouse' },
  ]

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories created')

  // ─── Seed Products ──────────────────────────────────────────────────────────
  const categories = await prisma.category.findMany()
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]))

  const products = [
    {
      name: 'Intel Core i9-13900K',
      slug: 'intel-core-i9-13900k',
      brand: 'Intel',
      price: '₹42,999',
      numericPrice: 42999,
      category: 'CPU',
      specs: ['24 Cores', '5.8GHz Boost', 'LGA1700', '125W'],
      description:
        'The ultimate desktop processor for gamers and creators. With 24 cores and blazing fast 5.8GHz boost clocks, this CPU crushes any workload you throw at it.',
      shortDescription: '24-core desktop processor with 5.8GHz boost clock',
      image: '/placeholder.jpg',
      badge: { label: 'Best Seller', tone: 'blue' },
      featured: true,
      stock: 15,
    },
    {
      name: 'AMD Ryzen 7 7700X',
      slug: 'amd-ryzen-7-7700x',
      brand: 'AMD',
      price: '₹28,499',
      numericPrice: 28499,
      category: 'CPU',
      specs: ['8 Cores', '5.4GHz Boost', 'AM5 Socket', '105W'],
      description:
        'Welcome to the new era of performance. The Ryzen 7 7700X features 8 high-performance cores built on the Zen 4 architecture, perfect for high-refresh-rate gaming.',
      shortDescription: '8-core Zen 4 processor with AM5 socket',
      image: '/placeholder.jpg',
      badge: { label: 'Top Pick', tone: 'purple' },
      featured: false,
      stock: 20,
    },
    {
      name: 'NVIDIA RTX 4070',
      slug: 'nvidia-rtx-4070',
      brand: 'NVIDIA',
      price: '₹54,999',
      numericPrice: 54999,
      category: 'GPU',
      specs: ['12GB GDDR6X', 'DLSS 3', 'Ray Tracing', '200W'],
      description:
        'Experience stunning visuals and AI-accelerated performance with DLSS 3. The RTX 4070 delivers incredible frame rates for 1440p gaming.',
      shortDescription: '12GB GDDR6X GPU with DLSS 3 and Ray Tracing',
      image: '/placeholder.jpg',
      badge: { label: 'Hot', tone: 'red' },
      featured: true,
      stock: 8,
    },
    {
      name: 'AMD Radeon RX 7600',
      slug: 'amd-radeon-rx-7600',
      brand: 'AMD',
      price: '₹24,999',
      numericPrice: 24999,
      category: 'GPU',
      specs: ['8GB GDDR6', '1080p King', 'FSR 3', '165W'],
      description:
        'Unbeatable value for 1080p gaming. Featuring 8GB of GDDR6 memory and support for AMD FidelityFX Super Resolution 3.',
      shortDescription: '8GB GDDR6 GPU for 1080p gaming',
      image: '/placeholder.jpg',
      featured: false,
      stock: 12,
    },
    {
      name: 'LG UltraGear 27" 4K',
      slug: 'lg-ultragear-27-4k',
      brand: 'LG',
      price: '₹38,999',
      numericPrice: 38999,
      category: 'Monitor',
      specs: ['IPS', '4K 144Hz', '1ms', 'HDR600'],
      description:
        'A breathtaking 4K Nano IPS display with a blistering 144Hz refresh rate and 1ms response time. Certified VESA DisplayHDR 600 for vivid colors.',
      shortDescription: '27" 4K IPS 144Hz monitor with HDR600',
      image: '/placeholder.jpg',
      badge: { label: 'New', tone: 'green' },
      featured: true,
      stock: 6,
    },
    {
      name: 'Samsung Odyssey G5 27"',
      slug: 'samsung-odyssey-g5-27',
      brand: 'Samsung',
      price: '₹22,499',
      numericPrice: 22499,
      category: 'Monitor',
      specs: ['VA Curved', '1440p', '165Hz', '1ms MPRT'],
      description:
        'Immerse yourself in the action with an aggressive 1000R curve. Features a sharp 1440p resolution and fluid 165Hz gameplay.',
      shortDescription: '27" curved VA 1440p 165Hz monitor',
      image: '/placeholder.jpg',
      featured: false,
      stock: 10,
    },
    {
      name: 'Keychron K8 Pro',
      slug: 'keychron-k8-pro',
      brand: 'Keychron',
      price: '₹8,499',
      numericPrice: 8499,
      category: 'Keyboard',
      specs: ['TKL', 'Hot-swap', 'Wireless', 'RGB'],
      description:
        'A premium customizable mechanical keyboard. QMK/VIA support, hot-swappable switches, and excellent acoustics out of the box.',
      shortDescription: 'TKL wireless hot-swap mechanical keyboard',
      image: '/placeholder.jpg',
      badge: { label: 'Popular', tone: 'purple' },
      featured: true,
      stock: 25,
    },
    {
      name: 'Logitech G Pro X',
      slug: 'logitech-g-pro-x',
      brand: 'Logitech',
      price: '₹9,999',
      numericPrice: 9999,
      category: 'Keyboard',
      specs: ['Full Size', 'Blue Switch', 'USB-C', 'Per-key RGB'],
      description:
        'Built for pros. Features swappable pro-grade switches, customizable LIGHTSYNC RGB, and a compact tenkeyless design.',
      shortDescription: 'Pro-grade mechanical keyboard with swappable switches',
      image: '/placeholder.jpg',
      featured: false,
      stock: 18,
    },
    {
      name: 'Logitech G502 X Plus',
      slug: 'logitech-g502-x-plus',
      brand: 'Logitech',
      price: '₹7,499',
      numericPrice: 7499,
      category: 'Mouse',
      specs: ['25,600 DPI', 'LIGHTFORCE', 'Wireless', 'RGB'],
      description:
        'The iconic G502 reinvented. Featuring hybrid optical-mechanical LIGHTFORCE switches and the HERO 25K sub-micron sensor.',
      shortDescription: 'Wireless gaming mouse with HERO 25K sensor',
      image: '/placeholder.jpg',
      featured: false,
      stock: 30,
    },
    {
      name: 'Razer DeathAdder V3',
      slug: 'razer-deathadder-v3',
      brand: 'Razer',
      price: '₹5,999',
      numericPrice: 5999,
      category: 'Mouse',
      specs: ['30,000 DPI', '90hr Battery', 'Ultralight'],
      description:
        'Ultra-lightweight ergonomic design refined for esports. Boasts the Focus Pro 30K Optical Sensor for flawless tracking.',
      shortDescription: 'Ultralight esports mouse with 30K DPI sensor',
      image: '/placeholder.jpg',
      featured: false,
      stock: 22,
    },
    {
      name: 'Corsair Vengeance DDR5 32GB',
      slug: 'corsair-vengeance-ddr5-32gb',
      brand: 'Corsair',
      price: '₹11,999',
      numericPrice: 11999,
      category: 'RAM',
      specs: ['2x16GB', 'DDR5-5600', 'CL36', 'RGB'],
      description:
        'Push the limits of performance with cutting-edge DDR5 memory, featuring brilliant ten-zone dynamic RGB lighting.',
      shortDescription: '32GB DDR5-5600 RGB desktop memory kit',
      image: '/placeholder.jpg',
      featured: false,
      stock: 14,
    },
    {
      name: 'G.Skill Trident Z5 64GB',
      slug: 'gskill-trident-z5-64gb',
      brand: 'G.Skill',
      price: '₹21,999',
      numericPrice: 21999,
      category: 'RAM',
      specs: ['2x32GB', 'DDR5-6000', 'CL30', 'RGB'],
      description:
        'Flagship dual-channel DDR5 memory designed for extreme performance and stunning aesthetics for the most high-end builds.',
      shortDescription: '64GB DDR5-6000 CL30 flagship memory kit',
      image: '/placeholder.jpg',
      featured: false,
      stock: 5,
    },
    {
      name: 'Samsung 990 Pro 1TB NVMe',
      slug: 'samsung-990-pro-1tb',
      brand: 'Samsung',
      price: '₹8,999',
      numericPrice: 8999,
      category: 'Storage',
      specs: ['PCIe 4.0', '7450MB/s Read', 'M.2', '5yr'],
      description:
        'The ultimate SSD for gamers and professionals. Delivers blistering sequential read/write speeds up to 7450/6900 MB/s.',
      shortDescription: '1TB PCIe 4.0 NVMe SSD with 7450MB/s read',
      image: '/placeholder.jpg',
      featured: false,
      stock: 20,
    },
    {
      name: 'Seagate Barracuda 2TB HDD',
      slug: 'seagate-barracuda-2tb',
      brand: 'Seagate',
      price: '₹3,999',
      numericPrice: 3999,
      category: 'Storage',
      specs: ['7200RPM', 'SATA III', '256MB Cache'],
      description:
        'Reliable high-capacity mass storage for your game library and media files. Features a 7200RPM spindle speed for fast load times.',
      shortDescription: '2TB 7200RPM SATA III desktop hard drive',
      image: '/placeholder.jpg',
      featured: false,
      stock: 35,
    },
  ]

  for (const p of products) {
    const { category, ...productData } = p
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        categoryId: catMap[category],
      },
    })
  }
  console.log('✅ Products created')

  // ─── Seed Site Settings ─────────────────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'JK Infosystem' },
    { key: 'site_tagline', value: "Chennai's Trusted PC Hardware Destination" },
    { key: 'site_description', value: 'Experience Technology Without Compromise.' },
    // Left blank on purpose — fill these in from the admin Settings page.
    // The frontend falls back to "coming soon" copy and hides dead links
    // until real values are set, instead of shipping placeholder text.
    { key: 'contact_phone', value: '' },
    { key: 'contact_email', value: '' },
    { key: 'contact_address', value: '' },
    { key: 'whatsapp_number', value: '' },
    { key: 'instagram_url', value: '' },
    { key: 'facebook_url', value: '' },
    { key: 'youtube_url', value: '' },
    { key: 'google_maps_url', value: '' },
    { key: 'working_hours', value: '' },
  ]

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log('✅ Site settings created')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
