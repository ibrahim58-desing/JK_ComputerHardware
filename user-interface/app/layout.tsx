import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FloatingButtons } from '@/components/floating-buttons'
import { PageTransition } from '@/components/page-transition'
import { getSiteSettings } from '@/lib/settings'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' })
const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})
const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JK Infosystem — Experience Technology Without Compromise',
  description:
    'From premium computers and professional imaging solutions to enterprise-grade IT services, JK Infosystem delivers authentic technology, trusted expertise, and exceptional service — Pan-India, since 1999.',
  keywords: [
    'JK Infosystem',
    'computer hardware India',
    'IT services India',
    'imaging solutions',
    'PC build India',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0057ff',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()

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
        <Footer settings={settings} />
        <FloatingButtons whatsappNumber={settings.whatsapp_number} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
