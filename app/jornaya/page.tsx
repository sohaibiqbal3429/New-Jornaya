'use client';

import { useState } from 'react';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const faqItems = [
  {
    q: 'Is Jornaya mandatory?',
    a: 'Not always. Requirements depend on buyer policy, vertical, and campaign risk profile. Many buyers strongly prefer verification-ready traffic.',
  },
  {
    q: 'How does LeadiD reduce fraud?',
    a: 'It adds verification metadata and event traceability that help identify suspicious patterns and improve screening confidence before acceptance.',
  },
  {
    q: 'Can buyers verify the lead?',
    a: 'Yes. Buyers can review delivered verification metadata and associated audit signals provided in routing or reporting workflows.',
  },
  {
    q: 'What consent language do you use?',
    a: 'Language is campaign-specific and aligned to buyer and vertical requirements, with version control and capture-time context retained.',
  },
  {
    q: 'Do you support ping/post?',
    a: 'Yes. We support configurable buyer routing models including ping/post style workflows where required.',
  },
  {
    q: 'How fast is integration setup?',
    a: 'Typical setup can be completed quickly once intake, compliance scope, and delivery specs are finalized.',
  },
  {
    q: 'What industries do you support?',
    a: 'We support multiple lead-gen verticals with channel and compliance controls configured to buyer requirements.',
  },
];

const journeySteps = [
  {
    title: 'Ad Click / Landing Page Visit',
    desc: 'A prospect arrives from paid media and lands on a tracked experience.',
  },
  {
    title: 'Consumer Form Submission',
    desc: 'The user submits details through a controlled lead capture form.',
  },
  {
    title: 'Consent + Disclosure Capture',
    desc: 'Disclosure context and consent events are recorded for verification.',
  },
  {
    title: 'LeadiD Token Generated & Attached',
    desc: 'A verification token is generated and associated with the lead event.',
  },
  {
    title: 'Lead Routed/Sold with Verification',
    desc: 'Buyers receive lead payloads with verification metadata for review.',
  },
];

const captureCards = [
  ['LeadiD Token (masked)', 'Reference token used to trace verification events.'],
  ['Timestamp & Session Signals', 'Time-based and session-level context tied to submission flow.'],
  ['Source & Campaign Attribution', 'Channel and campaign markers for buyer-side attribution clarity.'],
  ['Consent Language Snapshot (generic)', 'Versioned disclosure context at the time of action.'],
  ['Submission Metadata (high-level)', 'Form event details relevant to lead verification workflows.'],
  ['Buyer Delivery Logs', 'Records of routing and delivery outcomes for audit support.'],
];

export default function JornayaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div id="top" className={`${inter.className} ${plusJakarta.variable} min-h-screen scroll-smooth bg-slate-950 text-white`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-gradient-to-b from-orange-500/20 via-slate-950 to-transparent" />

      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="/" className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 ring-1 ring-orange-300/40">
              <span className="absolute inset-[3px] rounded-[10px] border border-white/25"></span>
              <span className="relative text-[11px] font-extrabold tracking-[0.08em] text-white">CHS</span>
            </span>
            <span className="text-lg font-bold tracking-tight text-white">Chatters Health Solutions</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="/#services" className="rounded text-sm text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Services</a>
            <a href="/#why" className="rounded text-sm text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Why Choose Us</a>
            <a href="/#process" className="rounded text-sm text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Process</a>
            <a href="/#about" className="rounded text-sm text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">About</a>
            <a href="/jornaya" aria-current="page" className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Jornaya</a>
          </div>

          <a href="/#quote" className="rounded bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">Get a Free Quote</a>
        </div>
      </nav>

      <a href="/#quote" className="fixed right-150 top-1/2 z-40 hidden -translate-y-1/2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 lg:inline-flex">
        Get Quote
      </a>

      <main>
        <section className="py-16 md:py-24 lg:py-28">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12">
            <div>
              <p className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Compliance-First Lead Verification
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl [font-family:var(--font-plus-jakarta)]">
                Jornaya (LeadiD) Verified Lead Journey
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-gray-400">
                Transparent, compliant, and auditable lead flow&mdash;from click to consent.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#contact-cta" className="rounded bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                  Talk to an Integration Specialist
                </a>
                <a href="#journey" className="rounded border border-slate-700 bg-slate-800/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                  View Lead Journey
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-sm font-medium text-gray-300 shadow-sm">Consent Capture</span>
                <span className="rounded-full border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-sm font-medium text-gray-300 shadow-sm">Audit Trail</span>
                <span className="rounded-full border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-sm font-medium text-gray-300 shadow-sm">Buyer Transparency</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-orange-500/20 blur-2xl" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-cyan-500/20 blur-2xl" />
              <article className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/40 p-6 shadow-xl shadow-black/30">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white [font-family:var(--font-plus-jakarta)]">Verification Card</h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Verified</span>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-gray-500">LeadID</span>
                    <span className="font-semibold text-white">LD-***-***-7021</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-gray-500">Timestamp</span>
                    <span className="font-semibold text-white">YYYY-MM-DD HH:MM:SS</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-gray-500">Source</span>
                    <span className="font-semibold text-white">Paid Search / Social</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-gray-500">Consent</span>
                    <span className="font-semibold text-emerald-700">Captured</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-semibold text-emerald-700">Verified</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="what-is" className="py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 rounded-2xl border border-slate-700 bg-slate-800/40 p-8 shadow-md shadow-black/20 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-white [font-family:var(--font-plus-jakarta)]">What is Jornaya (LeadiD)?</h2>
                <p className="mt-4 text-gray-400">
                  Jornaya LeadiD is a verification layer that helps document how a lead was generated and when consent occurred. In plain terms, it adds a traceable token to each lead event so buyers can review the verification trail with more confidence.
                </p>
                <p className="mt-3 text-gray-400">
                  We use this process to improve transparency and quality controls across paid acquisition funnels without exposing sensitive personal data.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-6">
                <h3 className="text-xl font-semibold text-white [font-family:var(--font-plus-jakarta)]">Why buyers care</h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />Fraud reduction through stronger verification signals.</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />Improved attribution visibility across channels and sessions.</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />Compliance visibility tied to capture events and timestamps.</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />Higher buyer confidence in lead quality and auditability.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="journey" className="py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 max-w-3xl">
              <h2 className="text-3xl font-bold text-white [font-family:var(--font-plus-jakarta)]">Lead Journey</h2>
              <p className="mt-3 text-gray-400">
                A structured five-step flow that maps how verification travels with a lead from first touch to buyer delivery.
              </p>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-700 to-transparent lg:block" />
              <div className="grid gap-5 lg:grid-cols-5">
                {journeySteps.map((step, i) => (
                  <article key={step.title} className="relative rounded-xl border border-slate-700 bg-slate-800/40 p-5 shadow-md shadow-black/20">
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded bg-orange-100 text-sm font-bold text-orange-700">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-400">{step.desc}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="mt-6 rounded-xl border border-cyan-700/50 bg-cyan-950/30 p-4 text-sm text-cyan-200 shadow-sm">
              We never expose sensitive consumer data&mdash;only verification metadata required for auditability.
            </aside>
          </div>
        </section>

        <section id="capture" className="py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 max-w-3xl">
              <h2 className="text-3xl font-bold text-white [font-family:var(--font-plus-jakarta)]">What We Capture (Without Being Creepy)</h2>
              <p className="mt-3 text-gray-400">
                Verification-focused metadata that supports transparency while respecting data minimization practices.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {captureCards.map(([title, desc]) => (
                <article key={title} className="rounded-xl border border-slate-700 bg-slate-800/40 p-5 shadow-md shadow-black/20">
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{desc}</p>
                </article>
              ))}
            </div>

            <p className="mt-5 text-sm text-gray-500">Details vary by campaign and client compliance requirements.</p>
          </div>
        </section>

        <section id="compliance" className="py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="text-3xl font-bold text-white [font-family:var(--font-plus-jakarta)]">Compliance &amp; Trust</h2>
                <p className="mt-4 text-gray-400">
                  Our posture is built around clear consent capture, verification retention, and buyer-facing transparency controls. Language, retention windows, and controls are tuned by campaign context.
                </p>
                <p className="mt-4 text-sm font-medium text-amber-700">
                  Not legal advice. Compliance requirements vary by industry and jurisdiction.
                </p>
              </div>

              <article className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 shadow-xl shadow-black/30">
                <h3 className="text-xl font-bold text-white [font-family:var(--font-plus-jakarta)]">Compliance Checklist</h3>
                <ul className="mt-5 space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />Clear disclosure placement</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />Consent checkbox + TCPA language (generic)</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />Audit trail retained (time-based)</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />Suppression &amp; QA process (generic)</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />Secure handling (generic)</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="integrations" className="py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-8 shadow-md shadow-black/20">
              <h2 className="text-3xl font-bold text-white [font-family:var(--font-plus-jakarta)]">Integrations</h2>
              <p className="mt-3 text-gray-400">Works with your existing stack through configurable delivery and routing workflows.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-gray-300">CRMs: Salesforce</span>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-gray-300">CRMs: HubSpot</span>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-gray-300">Dialers: Five9</span>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-gray-300">Dialers: Genesys</span>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-gray-300">Buyers / Ping Post: Generic</span>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white [font-family:var(--font-plus-jakarta)]">Frequently Asked Questions</h2>
              <p className="mt-3 text-gray-400">Common buyer questions about verification, transparency, and setup.</p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <article key={item.q} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/40 shadow-md shadow-black/20">
                    <h3>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        id={`faq-trigger-${i}`}
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                      >
                        {item.q}
                        <span className="ml-4 text-gray-500" aria-hidden="true">{isOpen ? '-' : '+'}</span>
                      </button>
                    </h3>
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-4 text-sm text-gray-400">{item.a}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact-cta" className="py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1300px] px-5 sm:px-8 lg:px-12">
            <div className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800/60 p-8 shadow-xl shadow-black/30 sm:p-10">
              <h2 className="text-3xl font-bold text-white [font-family:var(--font-plus-jakarta)]">Want Jornaya-ready leads that buyers trust?</h2>
              <p className="mt-3 text-gray-400">We build compliant funnels, capture verification, and deliver transparent leads.</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a href="#contact-cta" className="rounded bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                  Talk to an Integration Specialist
                </a>
                <a href="/#quote" className="rounded border border-slate-700 bg-slate-800/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                  Get a Free Quote
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-16 text-slate-300">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="mb-12 grid gap-8 md:grid-cols-5">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 ring-1 ring-orange-300/40">
                  <span className="absolute inset-[3px] rounded-[10px] border border-white/25"></span>
                  <span className="relative text-[11px] font-extrabold tracking-[0.08em] text-white">CHS</span>
                </span>
                <span className="font-bold tracking-tight text-white">Chatters Health Solutions</span>
              </div>
              <p className="text-sm text-slate-400">The premier global partner for high-volume lead generation and customer experience management.</p>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Chatters Health Solutions
                <br />
                422 S Main Street
                <br />
                Lombard, IL 60148
                <br />
                United States
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/#services" className="rounded transition hover:text-orange-400">Lead Generation</a></li>
                <li><a href="/#services" className="rounded transition hover:text-orange-400">Call Center</a></li>
                <li><a href="/#services" className="rounded transition hover:text-orange-400">Data Enrichment</a></li>
                <li><a href="/#services" className="rounded transition hover:text-orange-400">Digital Marketing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/#about" className="rounded transition hover:text-orange-400">About Us</a></li>
                <li><a href="#" className="rounded transition hover:text-orange-400">Careers</a></li>
                <li><a href="/#process" className="rounded transition hover:text-orange-400">Our Process</a></li>
                <li><a href="#" className="rounded transition hover:text-orange-400">Newsroom</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="rounded transition hover:text-orange-400">Privacy Policy</a></li>
                <li><a href="#" className="rounded transition hover:text-orange-400">Terms of Service</a></li>
                <li><a href="#" className="rounded transition hover:text-orange-400">Cookie Policy</a></li>
                <li><a href="#" className="rounded transition hover:text-orange-400">Compliance</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#contact-cta" className="rounded transition hover:text-orange-400">Integration Support</a></li>
                <li><a href="/#quote" className="rounded transition hover:text-orange-400">Get a Free Quote</a></li>
                <li><a href="#faq" className="rounded transition hover:text-orange-400">FAQ</a></li>
                <li><a href="#" className="rounded transition hover:text-orange-400">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-sm text-slate-400">Ãƒâ€šÃ‚Â© 2026 Chatters Health Solutions. All rights reserved.</p>
            <a href="#top" className="rounded text-sm text-slate-400 transition hover:text-orange-400">Back to top</a>
          </div>
        </div>
      </footer>
    </div>
  );
}





