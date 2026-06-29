import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { LangProvider } from '@/lib/lang-context'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })

export const metadata: Metadata = {
  title: 'ProServicio — Cotiza, agenda y cobra fácil',
  description: 'Cotiza, agenda y cobra desde tu celular. Para plomeros, electricistas, albañiles y más.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ProServicio',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-surface text-white font-sans antialiased">
        <AuthProvider>
          <LangProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
                success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
              }}
            />
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
