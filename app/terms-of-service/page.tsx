import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Chatters Health Solutions',
  description: 'Terms of Service for Chatters Health Solutions.',
};

const sections = [
  {
    title: 'Website Use',
    paragraphs: [
      'Chatters Health Solutions provides general information and contact tools related to Medicare insurance options.',
      'This website is privately owned and is not affiliated with or endorsed by Medicare, CMS, or any government agency.',
      'By using this website, you agree to use it only for lawful purposes and to provide accurate information in any forms you submit.',
    ],
  },
  {
    title: 'No Government Affiliation',
    paragraphs: [
      'Chatters Health Solutions is not a government agency, insurance company, or health plan issuer.',
      'We do not offer every plan available in every service area. Availability depends on ZIP code, carrier participation, and eligibility requirements.',
    ],
  },
  {
    title: 'No Guarantee of Coverage or Enrollment',
    paragraphs: [
      'Submitting a request for contact does not guarantee plan availability, eligibility, enrollment, or acceptance by any carrier.',
      'Enrollment in Medicare Advantage, Medicare Part D, or Medicare Supplement plans depends on carrier rules, Medicare rules, and applicable enrollment periods.',
    ],
  },
  {
    title: 'Third-Party Contact',
    paragraphs: [
      'By submitting your information, you understand that you may be contacted by a licensed insurance agent, producer, or insurance company.',
      'The purpose of this communication is the solicitation of insurance.',
    ],
  },
  {
    title: 'Content Disclaimer',
    paragraphs: [
      'The content on this website is for informational purposes only and should not be treated as legal, tax, or professional advice.',
      'While we aim to keep information current and accurate, we do not guarantee completeness, accuracy, or uninterrupted availability of the website.',
    ],
  },
  {
    title: 'Limitation of Liability',
    paragraphs: [
      'Chatters Health Solutions is not liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or reliance on its content.',
      'We are also not responsible for third-party content, carrier materials, or external websites linked from this site.',
    ],
  },
  {
    title: 'Changes',
    paragraphs: [
      'We may update these Terms of Service at any time by posting revised content on this page.',
      'Your continued use of the website after changes are posted constitutes acceptance of those updated terms.',
    ],
  },
  {
    title: 'Contact Information',
    paragraphs: [
      'Chatters Health Solutions LLC.',
      '+1 (202) 984-8556',
      'admin@chattershealthsolutions.com',
      '1500 N Grant St STE R Denver, CO 80203 United States',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-100 pt-16 text-slate-900">
      <section className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-slate-800" aria-label="Chatters Health Solutions home">
            <Image
              src="/chatters-health-logo.svg"
              alt="Chatters Health Solutions logo"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="text-lg font-semibold">Chatters Health Solutions</span>
          </Link>

          <Link
            href="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Back Home
          </Link>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">Terms of Service</h1>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 md:p-10">
            <div className="space-y-8">
              {sections.map((section) => (
                <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                  <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                  <div className="mt-4 space-y-4 text-base leading-7 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
