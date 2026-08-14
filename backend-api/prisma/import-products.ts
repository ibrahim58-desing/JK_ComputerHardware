// Bulk product import from an Excel (.xlsx) file into the products table.
//
// Usage:
//   npx tsx prisma/import-products.ts path/to/products.xlsx
//
// Expected columns (header row, case-insensitive, order doesn't matter):
//   name*, category*, price*, brand, description, shortDescription,
//   originalPrice, stock, specs, image, featured, status
//
// - category: matched by name against the categories table; created if it
//   doesn't exist yet.
// - specs: comma-separated string, e.g. "24 Cores, 5.8GHz Boost, LGA1700".
// - featured: TRUE/FALSE/1/0/yes/no.
// - status: "active" or "inactive" (defaults to active).
// - Rows are matched to existing products by slug (derived from name) and
//   upserted, so re-running the same file is safe and just updates prices/stock.

import * as XLSX from 'xlsx'
import { PrismaClient } from '@prisma/client'
import { parsePriceToNumber } from '../lib/utils'

const prisma = new PrismaClient()

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200)
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  const s = String(value ?? '').trim().toLowerCase()
  return s === 'true' || s === '1' || s === 'yes'
}

type Row = Record<string, unknown>

function getField(row: Row, ...keys: string[]): string {
  for (const key of Object.keys(row)) {
    if (keys.includes(key.trim().toLowerCase())) {
      const value = row[key]
      if (value !== undefined && value !== null) return String(value).trim()
    }
  }
  return ''
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx tsx prisma/import-products.ts path/to/products.xlsx')
    process.exit(1)
  }

  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const rows: Row[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })

  if (rows.length === 0) {
    console.error('No rows found in the first sheet of the workbook.')
    process.exit(1)
  }

  console.log(`Found ${rows.length} row(s) in "${sheetName}". Importing...`)

  const categoryCache = new Map<string, number>()

  let created = 0
  let updated = 0
  let skipped = 0

  for (const [index, row] of rows.entries()) {
    const rowNum = index + 2 // +1 for header, +1 for 1-indexing

    const name = getField(row, 'name', 'product name')
    const categoryName = getField(row, 'category')
    const priceRaw = getField(row, 'price')

    if (!name || !categoryName || !priceRaw) {
      console.warn(`Row ${rowNum}: skipped — missing required field (name/category/price).`)
      skipped++
      continue
    }

    let categoryId = categoryCache.get(categoryName.toLowerCase())
    if (!categoryId) {
      const categorySlug = generateSlug(categoryName)
      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: { name: categoryName, slug: categorySlug },
      })
      categoryId = category.id
      categoryCache.set(categoryName.toLowerCase(), categoryId)
    }

    const price = priceRaw.startsWith('₹') ? priceRaw : `₹${priceRaw}`
    const specsRaw = getField(row, 'specs')
    const specs = specsRaw ? specsRaw.split(',').map((s) => s.trim()).filter(Boolean) : []
    const stockRaw = getField(row, 'stock')
    const originalPriceRaw = getField(row, 'originalprice', 'original price')
    const statusRaw = getField(row, 'status').toLowerCase()

    const slug = generateSlug(name)

    const data = {
      name,
      description: getField(row, 'description'),
      shortDescription: getField(row, 'shortdescription', 'short description'),
      price,
      numericPrice: parsePriceToNumber(price),
      originalPrice: originalPriceRaw ? (originalPriceRaw.startsWith('₹') ? originalPriceRaw : `₹${originalPriceRaw}`) : null,
      stock: stockRaw ? parseInt(stockRaw, 10) || 0 : 0,
      brand: getField(row, 'brand'),
      specs: specs as any,
      image: getField(row, 'image') || '/placeholder.jpg',
      featured: parseBoolean(getField(row, 'featured')),
      status: statusRaw === 'inactive' ? 'inactive' : 'active',
      categoryId,
    }

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      await prisma.product.update({ where: { slug }, data })
      updated++
    } else {
      await prisma.product.create({ data: { ...data, slug } })
      created++
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
