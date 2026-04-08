import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { AuthDebug } from '@/components/AuthDebug'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MOSTRALY!',
  description: 'Peças de vestuário selecionadas com curadoria. Qualidade premium, preços honestos.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MOSTRALY!',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <AuthDebug />
        </AuthProvider>
      </body>
    </html>
  )
}
