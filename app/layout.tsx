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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${jetbrains.variable} bg-background`}
    >
      <body className="font-sans antialiased overflow-x-hidden">
        <Navbar />
        <PageTransition>
          <main>{children}</main>
        </PageTransition>
        <Footer />
        <FloatingButtons />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
