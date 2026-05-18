import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Chatters Health Solutions',
  description: 'Chatters Health Solutions landing page for Medicare plan assistance.',
  generator: 'Chatters Health Solutions',
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`theme-dark ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="LeadiDscript"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              var s = document.createElement('script');
              s.id = 'LeadiDscript_campaign';
              s.type = 'text/javascript';
              s.async = true;
              s.src = 'https://create.lidstatic.com/campaign/f3982147-9948-8ae0-9315-8ceb32269185.js?snippet_version=2';
              var LeadiDscript = document.getElementById('LeadiDscript');
              if (LeadiDscript && LeadiDscript.parentNode) {
                LeadiDscript.parentNode.insertBefore(s, LeadiDscript);
              }
            })();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        
        <Script id="theme-loader" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var t = localStorage.getItem('chs-theme');
                var c = document.documentElement.classList;
                c.remove('theme-dark', 'theme-light');
                c.add(t === 'theme-light' ? 'theme-light' : 'theme-dark');
              } catch (e) {}
            })();
          `}
        </Script>

        {children}
        <Analytics />
      </body>
    </html>
  )
}
