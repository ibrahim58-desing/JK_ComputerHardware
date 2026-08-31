// One-off maintenance script: clears the price on every product so the
// storefront shows no price at all (falls back to the "In Stock"/"Out of
// Stock" badge) until the client re-enters real prices product by product.
//
// Usage:
//   npx tsx prisma/reset-all-prices.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.product.updateMany({
    data: { price: '₹0', numericPrice: 0, originalPrice: null },
  })
  console.log(`Reset price on ${result.count} product(s).`)
}

main()
  .catch((e) => {
    console.error('Reset failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
