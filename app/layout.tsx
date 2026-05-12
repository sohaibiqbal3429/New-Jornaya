import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Apha Health Plan | Modern Medicare Guidance',
  description: 'Premium Medicare guidance, insurance assistance, plan comparison, licensed agent consultation, and enrollment support from Apha Health Plan.',
  generator: 'Apha Health Plan',
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="theme-dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('chs-theme');
                  var c = document.documentElement.classList;
                  c.remove('theme-dark','theme-light');
                  c.add(t === 'theme-light' ? 'theme-light' : 'theme-dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
