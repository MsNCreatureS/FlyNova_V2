import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BrandingProvider } from '@/contexts/BrandingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlyNova - Virtual Airline Management Platform',
  description: 'Modern virtual airline management platform for flight simulation enthusiasts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrandingProvider>
          {children}
        </BrandingProvider>
      </body>
    </html>
  )
}
