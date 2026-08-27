// One-time export of every table to a single JSON file, for moving from the
// PostgreSQL database (old VPS) to MySQL (new cPanel host). Run this BEFORE
// switching schema.prisma's provider to mysql — it needs the still-working
// Postgres connection/client to read the real production data.
//
// Usage: npx tsx prisma/migrate-export.ts
// Produces: prisma/data-export.json (in this same folder)

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Exporting all tables...')

  const [admins, categories, products, productImages, enquiries, testimonials, comments, siteSettings] =
    await Promise.all([
      prisma.admin.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.productImage.findMany(),
      prisma.enquiry.findMany(),
      prisma.testimonial.findMany(),
      prisma.comment.findMany(),
      prisma.siteSetting.findMany(),
    ])

  const data = { admins, categories, products, productImages, enquiries, testimonials, comments, siteSettings }

  const outPath = join(__dirname, 'data-export.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2))

  console.log('Done. Row counts:')
  console.log('  admins:', admins.length)
  console.log('  categories:', categories.length)
  console.log('  products:', products.length)
  console.log('  productImages:', productImages.length)
  console.log('  enquiries:', enquiries.length)
  console.log('  testimonials:', testimonials.length)
  console.log('  comments:', comments.length)
  console.log('  siteSettings:', siteSettings.length)
  console.log('\nWritten to:', outPath)
}

main()
  .catch((e) => {
    console.error('Export failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
