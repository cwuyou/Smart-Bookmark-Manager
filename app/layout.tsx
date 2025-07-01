import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart Bookmark Manager - 智能书签管理工具',
  description: '智能且有序的书签管理工具，支持分组管理、拖拽排序、快速搜索、导入导出等功能，让您的书签管理更轻松高效。',
  keywords: '书签管理,书签整理,书签分组,书签导入,书签导出,书签搜索',
  authors: [{ name: 'Smart Bookmark Manager Team' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://your-domain.com',
    title: 'Smart Bookmark Manager - 智能书签管理工具',
    description: '智能且有序的书签管理工具，支持分组管理、拖拽排序、快速搜索、导入导出等功能。',
    siteName: 'Smart Bookmark Manager',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Bookmark Manager - 智能书签管理工具',
    description: '智能且有序的书签管理工具，支持分组管理、拖拽排序、快速搜索、导入导出等功能。',
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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>{children}</body>
    </html>
  )
}
