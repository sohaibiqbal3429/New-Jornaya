import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { LeadIdRuntime } from "@/components/LeadIdRuntime";
import {
  LEADID_CANONICAL_FIELD_ID,
  LEADID_FIELD_NAME,
  LEADID_SCRIPT_ID,
  LEADID_SCRIPT_SRC,
} from "@/lib/leadid";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Alpha Legal Intake",
  description:
    "Alpha Legal Intake helps personal injury law firms grow with verified motor vehicle accident leads, live transfer calls, and professional intake support.",
  generator: "Alpha Legal Intake",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`theme-dark ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="font-sans antialiased">
        <input
          id={LEADID_CANONICAL_FIELD_ID}
          name={LEADID_FIELD_NAME}
          type="hidden"
          defaultValue=""
          readOnly
          aria-hidden="true"
        />

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

        <Script
          id={LEADID_SCRIPT_ID}
          src={LEADID_SCRIPT_SRC}
          strategy="beforeInteractive"
        />

        <Suspense fallback={null}>
          <LeadIdRuntime />
        </Suspense>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
