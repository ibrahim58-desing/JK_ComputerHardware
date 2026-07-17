import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FloatingButtons } from '@/components/floating-buttons'
import { PageTransition } from '@/components/page-transition'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})
const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'JK Computers — Power Your Build | Chennai',
  description:
    "Chennai's #1 computer hardware store. Genuine CPUs, GPUs, RAM, storage, monitors & peripherals at honest prices. Custom PC builds, repairs & expert advice.",
  generator: 'v0.app',
  keywords: [
    'computer hardware Chennai',
    'PC build Chennai',
    'GPU CPU store India',
    'JK Computers',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0057ff',
}

import { headers } from 'next/headers'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdmin = pathname.startsWith('/admin')

  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${jetbrains.variable} bg-background`}
    >
      <body className="font-sans antialiased overflow-x-hidden">
        {!isAdmin && <Navbar />}
        {!isAdmin ? (
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
        ) : (
          <main>{children}</main>
        )}
        {!isAdmin && <Footer />}
        {!isAdmin && <FloatingButtons />}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
