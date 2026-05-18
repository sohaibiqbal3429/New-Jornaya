import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
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

const leadIdScript = `
  (function() {
    var s = document.createElement('script');
    s.id = 'LeadiDscript_campaign';
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://create.lidstatic.com/campaign/f3982147-9948-8ae0-9315-8ceb32269185.js?snippet_version=2';
    var leadIdScriptNode = document.getElementById('LeadiDscript');
    if (leadIdScriptNode && leadIdScriptNode.parentNode) {
      leadIdScriptNode.parentNode.insertBefore(s, leadIdScriptNode);
    }
  })();
`

const themeLoaderScript = `
  (function() {
    var c = document.documentElement.classList;
    try {
      var storedTheme = localStorage.getItem('chs-theme');
      var isLightTheme = storedTheme === 'theme-light';
      c.remove('dark', 'theme-dark', 'theme-light');
      if (isLightTheme) {
        c.add('theme-light');
        return;
      }
      c.add('dark', 'theme-dark');
    } catch (e) {
      c.remove('theme-light');
      c.add('dark', 'theme-dark');
    }
  })();
`

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
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark theme-dark ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Script id="LeadiDscript" strategy="afterInteractive">{leadIdScript}</Script>

        <Script id="theme-loader" strategy="beforeInteractive">{themeLoaderScript}</Script>

        {children}
        <Analytics />
      </body>
    </html>
  )
}
