import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import './globals.css'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-raleway',
})

export const metadata: Metadata = {
  title: 'CelebrateConnect',
  description: 'CelebrateConnect is a platform for event management.',
  icons: {
    icon: '/assets/images/logo.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={raleway.variable}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
