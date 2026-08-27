// One-time import counterpart to migrate-export.ts — reads
// prisma/data-export.json and writes every row into the (empty) MySQL
// database, preserving the original IDs so relations still resolve
// correctly. Run this AFTER schema.prisma's provider is mysql and
// `prisma db push` has created the empty tables.
//
// Insert order matters (parents before children); MySQL automatically
// bumps a table's AUTO_INCREMENT counter past any explicit id it's given,
// so nothing else needs to happen for ids to keep working after this.
//
// Usage: npx tsx prisma/migrate-import.ts

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  const inPath = join(__dirname, 'data-export.json')
  const data = JSON.parse(readFileSync(inPath, 'utf-8'))

  console.log('Importing into MySQL...')

  if (data.categories?.length) {
    await prisma.category.createMany({ data: data.categories })
    console.log('  categories:', data.categories.length)
  }
  if (data.products?.length) {
    await prisma.product.createMany({ data: data.products })
    console.log('  products:', data.products.length)
  }
  if (data.productImages?.length) {
    await prisma.productImage.createMany({ data: data.productImages })
    console.log('  productImages:', data.productImages.length)
  }
  if (data.enquiries?.length) {
    await prisma.enquiry.createMany({ data: data.enquiries })
    console.log('  enquiries:', data.enquiries.length)
  }
  if (data.admins?.length) {
    await prisma.admin.createMany({ data: data.admins })
    console.log('  admins:', data.admins.length)
  }
  if (data.testimonials?.length) {
    await prisma.testimonial.createMany({ data: data.testimonials })
    console.log('  testimonials:', data.testimonials.length)
  }
  if (data.comments?.length) {
    await prisma.comment.createMany({ data: data.comments })
    console.log('  comments:', data.comments.length)
  }
  if (data.siteSettings?.length) {
    await prisma.siteSetting.createMany({ data: data.siteSettings })
    console.log('  siteSettings:', data.siteSettings.length)
  }

  console.log('\nDone.')
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
