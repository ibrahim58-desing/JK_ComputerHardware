import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MessageCircle, CheckCircle2, ShieldCheck, Truck } from 'lucide-react'
import { products, categoryIcons, badgeClasses } from '@/lib/products'
import { PageHero } from '@/components/page-hero'
import { ProductCard } from '@/components/product-card'

export function generateStaticParams() {
  return products.map((p) => ({
    id: p.id.toString(),
  }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const product = products.find((p) => p.id.toString() === resolvedParams.id)

  if (!product) {
    notFound()
  }

  const Icon = categoryIcons[product.category]
  const waMessage = encodeURIComponent(
    `Hi JK Computers! I am interested in buying ${product.name}. Please share availability and details.`
  )

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <>
      <PageHero
        title={product.name}
        subtitle={`${product.brand} · ${product.category}`}
        variant="white"
      />
      <section className="bg-background px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/products"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Product Image Area */}
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-card-border bg-surface flex items-center justify-center p-12">
              <div className="absolute left-6 top-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon size={32} />
              </div>
              {product.badge && (
                <span
                  className={`absolute right-6 top-6 rounded-full px-4 py-1.5 font-mono text-sm font-semibold uppercase tracking-wide ${badgeClasses[product.badge.tone]}`}
                >
                  {product.badge.label}
                </span>
              )}
              {/* Fallback to a styled container if real image is not loaded perfectly */}
              <div className="relative w-full h-full max-w-sm max-h-sm opacity-50 mix-blend-multiply">
                 <Image src={product.image} alt={product.name} fill className="object-contain" priority />
              </div>
            </div>

            {/* Product Details Area */}
            <div className="flex flex-col justify-center">
              <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center gap-4">
                <span className="font-heading text-4xl font-bold text-primary">
                  {product.price}
                </span>
                <span className="rounded-md bg-green-50 px-2.5 py-1 text-sm font-medium text-green-700">
                  In Stock
                </span>
              </div>

              <p className="mt-6 text-base leading-relaxed text-text-secondary">
                {product.description}
              </p>

              <div className="mt-8 rounded-2xl border border-card-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold text-foreground mb-4">Key Specifications</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {product.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 size={16} className="text-primary" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href={`https://wa.me/919876543210?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle size={20} />
                  WhatsApp to Order
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
                 <div className="flex items-center gap-3">
                   <ShieldCheck size={20} className="text-primary" />
                   <span className="text-sm font-medium text-text-secondary">Official Warranty</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <Truck size={20} className="text-primary" />
                   <span className="text-sm font-medium text-text-secondary">Fast Delivery</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-surface px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 font-heading text-2xl font-bold text-foreground">
              You might also like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
