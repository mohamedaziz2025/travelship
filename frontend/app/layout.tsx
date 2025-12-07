import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TravelShip - Connectez voyageurs et expéditeurs',
  description: 'Plateforme premium de mise en relation entre voyageurs et expéditeurs. Envoyez ou transportez des colis en toute sécurité.',
  keywords: ['voyage', 'colis', 'transport', 'shipping', 'travel'],
  authors: [{ name: 'TravelShip' }],
  openGraph: {
    title: 'TravelShip',
    description: 'Connectez voyageurs et expéditeurs',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
