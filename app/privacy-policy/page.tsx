import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Alpha Legal Intake",
  description: "Privacy Policy for Alpha Legal Intake.",
};

type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const policySections: PolicySection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "Welcome to Alpha Legal Intake. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website, submit an intake request, or communicate with us about motor vehicle accident leads, live transfer calls, or personal injury intake support.",
      "By using our website or submitting information through our forms, you acknowledge the practices described in this Privacy Policy.",
    ],
  },
  {
    title: "Information We Collect",
    paragraphs: [
      "We collect information you voluntarily provide, such as your name, phone number, email address, ZIP code, and details related to your inquiry or requested intake services.",
      "We may also collect technical information such as IP address, browser type, device details, referring URLs, form interaction data, LeadiD verification values, and website usage information.",
      "If you do not want to provide requested information, you should not submit the form or should discontinue the submission process.",
    ],
    bullets: [
      "Contact and identification information submitted through website forms.",
      "Consent records, timestamps, page source, and related lead verification details.",
      "Usage data gathered through cookies, analytics tools, logs, and similar technologies.",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: [
      "We use submitted information to respond to inquiries, route intake requests, support live transfer workflows, evaluate lead quality, maintain consent and verification records, and improve our website and services.",
      "We may use contact information to communicate with you about Alpha Legal Intake services, requested lead generation support, operational updates, and related business communications.",
    ],
  },
  {
    title: "Information Sharing and Disclosure",
    paragraphs: [
      "We may share information with vendors, service providers, intake partners, law firm customers, analytics providers, compliance tools, or other contractors who help us operate the website and deliver requested services.",
      "We may disclose information when required to comply with applicable law, legal process, regulatory obligations, fraud prevention, security needs, or to protect the rights and safety of Alpha Legal Intake and others.",
    ],
  },
  {
    title: "Legal Intake Disclaimer",
    paragraphs: [
      "Alpha Legal Intake is not a law firm and does not provide legal advice, legal representation, or legal services.",
      "Submitting information through this website does not create an attorney-client relationship with Alpha Legal Intake or any law firm.",
      "Lead availability, transfer volume, and qualification results may vary based on campaign settings, geography, demand, compliance requirements, and other operational factors.",
    ],
  },
  {
    title: "Your Choices",
    paragraphs: [
      "You may choose not to submit information through our forms. If you have previously submitted information, you may contact us to request that we update or delete information where required by applicable law.",
      "You may opt out of certain communications by following instructions provided in those communications or by contacting us directly.",
    ],
  },
  {
    title: "Security",
    bullets: [
      "We use reasonable administrative, technical, and organizational safeguards to help protect information submitted through our website.",
      "No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      "Administrative access to internal systems is restricted and protected through authentication and security controls.",
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "Our website and services are intended for adults and business users. We do not knowingly collect personal information from children under the age of 13.",
    ],
  },
  {
    title: "Contact Us",
    bullets: [
      "Alpha Legal Intake",
      "+1 (202) 984-8556",
      "hello@alphalegalintake.com",
      "1500 N Grant St STE R Denver, CO 80203 United States",
    ],
  },
];

const sectionIcons: Record<string, string> = {
  Introduction: "01",
  "Information We Collect": "02",
  "How We Use Your Information": "03",
  "Information Sharing and Disclosure": "04",
  "Legal Intake Disclaimer": "05",
  "Your Choices": "06",
  Security: "07",
  "Children's Privacy": "08",
  "Contact Us": "09",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="alpha-site min-h-screen text-slate-900">
      <header className="sticky top-4 z-50 px-4">
        <div className="alpha-floating-header mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-[#062032]"
            aria-label="Alpha Legal Intake home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#062032] text-lg font-black text-[#11c5ba]">
              A
            </span>
            <span className="text-lg font-bold">Alpha Legal Intake</span>
          </Link>

          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link
              href="/terms-of-service"
              className="text-slate-600 transition hover:text-[#062032]"
            >
              Terms
            </Link>
            <Link href="/" className="alpha-secondary-button px-4 py-2">
              Back Home
            </Link>
          </div>
        </div>
      </header>

      <section className="alpha-soft-gradient pt-24 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="alpha-eyebrow inline-flex rounded-full border border-teal-200 bg-white/70 px-4 py-2">
              Legal Information
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#062032] sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              We value clarity, transparency, and trust. This page explains how
              Alpha Legal Intake collects, uses, and protects information when
              you interact with our website and legal-intake services.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20 pt-2 sm:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:px-8">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="alpha-card overflow-hidden">
              <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50 to-sky-50 px-5 py-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
                  On this page
                </h2>
              </div>

              <nav className="p-3">
                <ul className="space-y-1.5">
                  {policySections.map((section) => {
                    const sectionId = section.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-");

                    return (
                      <li key={section.title}>
                        <a
                          href={`#${sectionId}`}
                          className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 transition hover:bg-teal-50 hover:text-[#062032]"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700 transition group-hover:bg-teal-100">
                            {sectionIcons[section.title] ?? "•"}
                          </span>
                          <span className="font-medium leading-5">
                            {section.title}
                          </span>
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
              const sectionId = section.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-");

              return (
                <section
                  id={sectionId}
                  key={section.title}
                  className="alpha-rounded-card overflow-hidden"
                >
                  <div className="border-b border-slate-100 bg-gradient-to-r from-white via-teal-50/40 to-sky-50/60 px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#062032] text-sm font-black text-teal-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-2xl font-black tracking-tight text-[#062032] sm:text-[30px]">
                          {section.title}
                        </h2>
                        <div className="mt-2 h-1.5 w-16 rounded-full bg-teal-500" />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-6 sm:px-8 sm:py-8">
                    {section.paragraphs ? (
                      <div className="space-y-5 text-[15px] leading-8 text-slate-700 sm:text-base">
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <p
                            key={`${section.title}-paragraph-${paragraphIndex}`}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {section.bullets ? (
                      <ul
                        className={`grid gap-3 text-[15px] leading-8 text-slate-700 sm:text-base ${section.paragraphs ? "mt-6" : ""}`}
                      >
                        {section.bullets.map((bullet, bulletIndex) => (
                          <li
                            key={`${section.title}-bullet-${bulletIndex}`}
                            className="flex items-start gap-4 rounded-2xl border border-teal-100 bg-teal-50/50 px-4 py-4"
                          >
                            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
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
