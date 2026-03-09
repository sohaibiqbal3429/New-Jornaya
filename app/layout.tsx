import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Chatters Health Solutions',
  description: 'Chatters Health Solutions landing page for Medicare plan assistance.',
  generator: 'Chatters Health Solutions',
  icons: {
    icon: '/chatters-health-logo.svg',
    shortcut: '/chatters-health-logo.svg',
    apple: '/chatters-health-logo.svg',
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
