import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3d epic',
  description: 'Created with JMMM',
  generator: 'JMMM',
  icons: {
    icon: '/carrot1.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
