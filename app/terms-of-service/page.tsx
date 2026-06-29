import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Alpha Legal Intake",
  description: "Terms of Service for Alpha Legal Intake.",
};

const sections = [
  {
    title: "Website Use",
    paragraphs: [
      "Alpha Legal Intake provides general information and contact tools related to motor vehicle accident lead generation, live transfer calls, and personal injury intake support.",
      "By using this website, you agree to use it only for lawful purposes and to provide accurate information in any forms you submit.",
    ],
  },
  {
    title: "Not a Law Firm",
    paragraphs: [
      "Alpha Legal Intake is not a law firm and does not provide legal advice, legal representation, or legal services.",
      "No attorney-client relationship is created by using this website, submitting a form, receiving a call, or communicating with Alpha Legal Intake.",
    ],
  },
  {
    title: "No Guarantee of Results",
    paragraphs: [
      "Submitting a request or purchasing services does not guarantee case acceptance, legal outcomes, signed clients, transfer volume, lead availability, or qualification results.",
      "Lead availability, transfer volume, and qualification results may vary based on campaign settings, geography, demand, compliance requirements, intake criteria, and other operational factors.",
    ],
  },
  {
    title: "Third-Party Contact and Intake Partners",
    paragraphs: [
      "By submitting information through this website, you understand that Alpha Legal Intake or its intake, marketing, technology, or law firm partners may contact you about your inquiry or requested services.",
      "Third-party partners are responsible for their own services, decisions, intake criteria, and communications.",
    ],
  },
  {
    title: "Content Disclaimer",
    paragraphs: [
      "The content on this website is for informational and marketing purposes only and should not be treated as legal, tax, financial, or professional advice.",
      "While we aim to keep information current and accurate, we do not guarantee completeness, accuracy, uninterrupted availability, or error-free operation of the website.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "Alpha Legal Intake is not liable for any direct, indirect, incidental, consequential, special, exemplary, or punitive damages arising from your use of this website, submitted information, lead generation services, or reliance on site content.",
      "We are not responsible for third-party content, partner materials, external websites, or downstream intake decisions made by law firms, intake providers, or other third parties.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may update these Terms of Service at any time by posting revised content on this page.",
      "Your continued use of the website after changes are posted constitutes acceptance of those updated terms.",
    ],
  },
  {
    title: "Contact Information",
    paragraphs: [
      "Alpha Legal Intake",
      "+1 (202) 984-8556",
      "hello@alphalegalintake.com",
      "1500 N Grant St STE R Denver, CO 80203 United States",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="alpha-site min-h-screen pt-20 text-[#062032]">
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="alpha-floating-header mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
              href="/privacy-policy"
              className="text-slate-600 transition hover:text-[#062032]"
            >
              Privacy
            </Link>
            <Link href="/" className="alpha-secondary-button px-4 py-2">
              Back Home
            </Link>
          </div>
        </div>
      </header>

      <section className="alpha-soft-gradient py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="alpha-eyebrow inline-flex rounded-full border border-teal-200 bg-white/70 px-4 py-2">
            Legal Information
          </p>
          <h1 className="mt-6 text-4xl font-black leading-tight text-[#062032] md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            These terms describe how you may use the Alpha Legal Intake website
            and related legal-intake marketing services.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="alpha-rounded-card p-6 md:p-8"
              >
                <h2 className="text-2xl font-black text-[#062032]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-slate-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
