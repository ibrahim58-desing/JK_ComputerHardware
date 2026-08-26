// Bulk product import from an Excel (.xlsx) file into the products table.
//
// Usage:
//   npx tsx prisma/import-products.ts path/to/products.xlsx
//
// Expected columns (header row, case-insensitive, order doesn't matter):
//   name*, category*, price, brand, description, shortDescription,
//   originalPrice, stock, specs, image, featured, status
//   (* = required; price defaults to ₹0 if left blank)
//
// - category: matched by name against the categories table; created if it
//   doesn't exist yet.
// - specs: "|"-separated string, e.g. "24 Cores | 5.8GHz Boost | LGA1700".
//   Falls back to splitting on "," if the cell has no "|" at all, so plain
//   comma-separated spec lists (with no commas inside a single spec) still work.
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

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

// Bounded concurrency, not full parallelism — a 20,000-row import firing
// every update at once would exhaust the shared connection pool that the
// live storefront and admin panel are also using.
const UPDATE_CONCURRENCY = 25
const CREATE_BATCH_SIZE = 500

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

  let skipped = 0

  // Pass 1: validate rows and resolve each one's category — cheap, since
  // categories are cached after their first upsert and there are only ever
  // a handful of them, unlike products.
  const parsed: { slug: string; data: Record<string, unknown> }[] = []

  for (const [index, row] of rows.entries()) {
    const rowNum = index + 2 // +1 for header, +1 for 1-indexing

    const name = getField(row, 'name', 'product name')
    const categoryName = getField(row, 'category')
    const priceRaw = getField(row, 'price')

    if (!name || !categoryName) {
      console.warn(`Row ${rowNum}: skipped — missing required field (name/category).`)
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

    const price = !priceRaw ? '₹0' : priceRaw.startsWith('₹') ? priceRaw : `₹${priceRaw}`
    const specsRaw = getField(row, 'specs')
    const specsDelimiter = specsRaw.includes('|') ? '|' : ','
    const specs = specsRaw ? specsRaw.split(specsDelimiter).map((s) => s.trim()).filter(Boolean) : []
    const stockRaw = getField(row, 'stock')
    const originalPriceRaw = getField(row, 'originalprice', 'original price')
    const statusRaw = getField(row, 'status').toLowerCase()

    const slug = generateSlug(name)

    parsed.push({
      slug,
      data: {
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
      },
    })
  }

  // Pass 2: one query to find out which slugs already exist, instead of a
  // findUnique per row.
  const existingSlugs = new Set(
    (
      await prisma.product.findMany({
        where: { slug: { in: parsed.map((p) => p.slug) } },
        select: { slug: true },
      })
    ).map((p) => p.slug)
  )

  const toCreate = parsed.filter((p) => !existingSlugs.has(p.slug))
  const toUpdate = parsed.filter((p) => existingSlugs.has(p.slug))

  // New products can go in as bulk inserts.
  for (const batch of chunk(toCreate, CREATE_BATCH_SIZE)) {
    await prisma.product.createMany({
      data: batch.map((p) => ({ ...p.data, slug: p.slug }) as any),
    })
  }

  // Existing products each need their own UPDATE (the data differs per
  // row), but running a bounded number concurrently instead of one at a
  // time turns ~2 sequential round trips per row into a fraction of that.
  for (const batch of chunk(toUpdate, UPDATE_CONCURRENCY)) {
    await Promise.all(
      batch.map((p) => prisma.product.update({ where: { slug: p.slug }, data: p.data as any }))
    )
  }

  console.log(`\nDone. Created: ${toCreate.length}, Updated: ${toUpdate.length}, Skipped: ${skipped}`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
