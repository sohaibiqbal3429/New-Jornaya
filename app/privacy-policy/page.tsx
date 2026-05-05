import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Privacy Policy | Chatters Health Solutions',
  description: 'Privacy Policy for Chatters Health Solutions.',
};

type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const policySections: PolicySection[] = [
  {
    title: 'Introduction',
    paragraphs: [
      'Welcome to Chatters Health Solutions. Your privacy is important to us, and we are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or use our website and services.',
      'By using our services or submitting information through our website, you acknowledge and agree to the terms described in this Privacy Policy at the time of your use.',
    ],
  },
  {
    title: 'Information We Collect',
    paragraphs: [
      'Chatters Health Solutions does not collect personal information unless you voluntarily provide it. This may occur through forms such as the Get Medicare Help form, quote request pages, newsletter signups, or other areas of the website where information submission is required.',
      'For the purpose of this Privacy Policy, personal information refers to information that identifies you as an individual. This may include your name, phone number, email address, mailing address, birth date, or similar identifying details.',
      'We may also collect demographic information such as age, gender, or related details that you voluntarily provide through forms, live chat, or other communication tools available on our website.',
      'If you reach a page requesting information that you do not wish to provide, you should not enter that information and should discontinue the form submission process.',
      'If you choose to submit personal information, we may use it to respond to your inquiries, provide insurance-related information, connect you with licensed agents, or fulfill the purpose stated on the page where the information was collected.',
      'We do not sell your personal information. Information may only be shared when necessary to provide services, work with service providers or contractors, comply with legal requirements, or connect you with licensed insurance professionals or insurance carriers offering plans in your area.',
      'Information you provide may also be used to improve our website, enhance our services, and communicate with you regarding services or marketing information.',
    ],
    bullets: [
      'Non-Personal Information: We may automatically collect information such as your IP address, browser type, device information, and website usage statistics.',
      'Cookies, web beacons, and similar technologies may be used to analyze website usage and improve user experience.',
    ],
  },
  {
    title: 'How We Use Your Information',
    paragraphs: [
      'If you complete the contact form on this website or call the number listed, you may be connected with a licensed insurance agent who can help answer your questions and provide information regarding Medicare Advantage, Medicare Part D, or Medicare Supplement insurance plans.',
      'By submitting a form, you may request to be contacted by a licensed insurance agent who can provide assistance related to Medicare coverage options.',
      'The purpose of these communications is the solicitation of insurance products.',
    ],
  },
  {
    title: 'Information Sharing and Disclosure',
    paragraphs: [
      'If you request assistance, contact may be made by a licensed insurance agent, insurance producer, or insurance company representative.',
      'Chatters Health Solutions and its representatives are not affiliated with, endorsed by, or connected to the U.S. government or the federal Medicare program.',
      'Chatters Health Solutions is not responsible for content submitted or posted by users or third parties on this website and assumes no liability for such content.',
    ],
  },
  {
    title: 'Your Choices',
    paragraphs: [
      'Your consent is required before submitting any personal information through forms on this website.',
      'For complete information regarding Medicare options, please visit Medicare.gov, call 1-800-MEDICARE (TTY users: 1-877-486-2048) 24 hours a day, 7 days a week, or contact your local State Health Insurance Assistance Program (SHIP).',
    ],
  },
  {
    title: 'Security',
    bullets: [
      'We use secure technologies such as HTTPS to protect information transmitted through the website.',
      'Administrative access to internal systems is restricted and protected through authentication and security controls.',
      'Reasonable security measures are implemented to protect personal information from unauthorized access, misuse, or disclosure.',
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      'Our services are intended primarily for individuals seeking Medicare-related information, which generally applies to individuals age 65 or older.',
      'Medicare Supplement insurance is generally available to individuals age 65 or older who are enrolled in Medicare Parts A and B. In some states it may also be available to individuals under age 65 who qualify for Medicare due to disability or End-Stage Renal Disease (ESRD).',
      'We do not knowingly collect personal information from children under the age of 13.',
    ],
  },
  {
    title: 'Contact Us',
    bullets: [
      'Chatters Health Solutions LLC.',
      '+1 (202) 984-8556',
      'admin@chattershealthsolutions.com',
      '1500 N Grant St STE R Denver, CO 80203 United States',
    ],
  },
];

const sectionIcons: Record<string, string> = {
  Introduction: '01',
  'Information We Collect': '02',
  'How We Use Your Information': '03',
  'Information Sharing and Disclosure': '04',
  'Your Choices': '05',
  Security: '06',
  "Children's Privacy": '07',
  'Contact Us': '08',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-2xl transition hover:opacity-90"
            aria-label="Chatters Health Solutions home"
          >
            <Image
              src="/chatters-health-logo-clean.png"
              alt="Chatters Health Solutions logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Policy Center
              </p>
              <span className="block truncate text-base font-bold text-slate-900 sm:text-lg">
                Chatters Health Solutions
              </span>
            </div>
          </Link>

        
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_right,rgba(59,130,246,0.08),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Legal Information
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              We value clarity, transparency, and trust. This page explains how Chatters Health
              Solutions collects, uses, and protects your information when you interact with our
              website and services.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Company
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">Chatters Health Solutions</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Document
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">Website Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 pt-2 sm:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:px-8">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-5 py-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
                  On this page
                </h2>
              </div>

              <nav className="p-3">
                <ul className="space-y-1.5">
                  {policySections.map((section) => {
                    const sectionId = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                    return (
                      <li key={section.title}>
                        <a
                          href={`#${sectionId}`}
                          className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 transition group-hover:bg-cyan-100 group-hover:text-cyan-700">
                            {sectionIcons[section.title] ?? '•'}
                          </span>
                          <span className="font-medium leading-5">{section.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          <div className="space-y-6 sm:space-y-8">
            {policySections.map((section, index) => {
              const sectionId = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

              return (
                <section
                  id={sectionId}
                  key={section.title}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-20px_rgba(15,23,42,0.2)]"
                >
                  <div className="border-b border-slate-100 bg-gradient-to-r from-white via-cyan-50/40 to-sky-50/60 px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[30px]">
                          {section.title}
                        </h2>
                        <div className="mt-2 h-1.5 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-6 sm:px-8 sm:py-8">
                    {section.paragraphs ? (
                      <div className="space-y-5 text-[15px] leading-8 text-slate-700 sm:text-base">
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <p key={`${section.title}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}

                    {section.bullets ? (
                      <ul
                        className={`grid gap-3 text-[15px] leading-8 text-slate-700 sm:text-base ${
                          section.paragraphs ? 'mt-6' : ''
                        }`}
                      >
                        {section.bullets.map((bullet, bulletIndex) => (
                          <li
                            key={`${section.title}-bullet-${bulletIndex}`}
                            className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4"
                          >
                            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                              ✓
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
