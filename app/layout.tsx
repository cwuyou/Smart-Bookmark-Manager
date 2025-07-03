import type { Metadata } from 'next'
import './globals.css'
import GoogleAnalytics from '@/components/google-analytics'
import { LanguageProvider } from '@/lib/i18n/language-context'
import { ThemeProvider } from '@/lib/theme-context'

export const metadata: Metadata = {
  title: 'Smart Bookmark Manager',
  description: 'Intelligent and organized bookmark management tool with features like group management, drag and drop sorting, quick search, import/export, and more.',
  keywords: 'bookmark manager,bookmark organizer,bookmark groups,bookmark import,bookmark export,bookmark search',
  authors: [{ name: 'Smart Bookmark Manager Team' }],
  openGraph: {
    type: 'website',
    locale: 'en',
    url: 'https://your-domain.com',
    title: 'Smart Bookmark Manager',
    description: 'Intelligent and organized bookmark management tool with features like group management, drag and drop sorting, quick search, and more.',
    siteName: 'Smart Bookmark Manager',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Bookmark Manager',
    description: 'Intelligent and organized bookmark management tool with features like group management, drag and drop sorting, quick search, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-site-verification',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <GoogleAnalytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
