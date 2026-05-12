'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  HeartHandshake,
  Hospital,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { PremiumSubmissionAlert } from '@/components/PremiumSubmissionAlert';

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  zipCode: string;
  email: string;
};

type FormFieldName = keyof FormData;

type SubmissionAlertState = {
  open: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error';
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  zipCode: '',
  email: '',
};

const requiredFields = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'phone', label: 'Phone number' },
  { name: 'zipCode', label: 'ZIP code' },
] as const satisfies ReadonlyArray<{ name: Exclude<FormFieldName, 'email'>; label: string }>;

const navItems = [
  { label: 'Coverage', href: '#coverage' },
  { label: 'Why Apha', href: '#why-apha' },
  { label: 'Process', href: '#process' },
  { label: 'FAQ', href: '#faq' },
];

const coverageFeatures = [
  {
    eyebrow: 'Medicare navigation',
    title: 'Plan intelligence without the fine-print fatigue',
    copy: 'Compare Medicare Advantage, Medicare Supplement, and Part D considerations with guidance that turns complex plan details into clear tradeoffs.',
    icon: Stethoscope,
    points: ['Local ZIP-based availability', 'Benefits and network context', 'Prescription coverage review'],
  },
  {
    eyebrow: 'Insurance assistance',
    title: 'Human support for the decisions that matter',
    copy: 'Apha helps you prepare the right questions, understand timing rules, and connect with licensed professionals when a conversation would help.',
    icon: HeartHandshake,
    points: ['Licensed agent consultation', 'Carrier-neutral education', 'No-pressure next steps'],
  },
  {
    eyebrow: 'Enrollment support',
    title: 'A calmer path from comparison to completion',
    copy: 'From first review through application readiness, our workflow keeps your preferences, deadlines, and documentation organized.',
    icon: ClipboardCheck,
    points: ['Eligibility checkpoints', 'Application readiness', 'Follow-through reminders'],
  },
];

const trustPillars = [
  {
    title: 'Licensed advisor access',
    copy: 'When you want a professional conversation, we help route you to licensed insurance agents who can explain available plan options.',
    icon: BadgeCheck,
  },
  {
    title: 'Personalized coverage lens',
    copy: 'Your doctors, prescriptions, budget, and preferred care style shape the discussion instead of a generic one-size-fits-all list.',
    icon: UsersRound,
  },
  {
    title: 'Transparent guidance',
    copy: 'We separate education from enrollment so you can understand what each path may mean before you make a decision.',
    icon: ShieldCheck,
  },
  {
    title: 'Momentum when timing matters',
    copy: 'Enrollment windows can be confusing. Our streamlined intake helps surface next steps quickly and clearly.',
    icon: CalendarCheck,
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Share your basics',
    copy: 'Tell us your ZIP code, contact details, and the type of support you want so the review starts with the right context.',
  },
  {
    step: '02',
    title: 'Clarify priorities',
    copy: 'We frame the decision around healthcare preferences: providers, prescriptions, total cost expectations, and enrollment timing.',
  },
  {
    step: '03',
    title: 'Review options',
    copy: 'Compare available plan categories and tradeoffs with a licensed agent consultation when appropriate.',
  },
  {
    step: '04',
    title: 'Move forward confidently',
    copy: 'Receive support for application readiness, reminders, and a clear record of what to expect next.',
  },
];

const testimonials = [
  {
    quote: 'Apha made a complicated Medicare review feel organized and respectful. I finally understood what questions to ask before choosing.',
    name: 'Marian L.',
    detail: 'Retiree, Arizona',
  },
  {
    quote: 'The experience felt calm and premium from the first step. No pressure, just practical help and a clear explanation of our options.',
    name: 'Daniel R.',
    detail: 'Caregiver, North Carolina',
  },
  {
    quote: 'I appreciated how they focused on my prescriptions and doctors instead of rushing straight into an application.',
    name: 'Evelyn T.',
    detail: 'Medicare shopper, Ohio',
  },
];

const faqs = [
  {
    question: 'Is Apha Health Plan a government website?',
    answer:
      'No. Apha Health Plan is a privately owned, non-government website. We are not connected with or endorsed by Medicare, CMS, Healthcare.gov, or any government agency.',
  },
  {
    question: 'Will I see every plan available in my area?',
    answer:
      'Not necessarily. Plan availability depends on your ZIP code, carrier participation, eligibility, and enrollment timing. Medicare.gov and 1-800-MEDICARE remain official sources for all Medicare information.',
  },
  {
    question: 'What happens after I submit the consultation form?',
    answer:
      'We securely record your request and may connect you with a licensed insurance agent who can discuss Medicare Advantage, Medicare Supplement, or Part D options based on your needs.',
  },
  {
    question: 'Does requesting help obligate me to enroll?',
    answer:
      'No. Submitting your information starts a conversation. You are not required to choose or enroll in a plan through Apha Health Plan.',
  },
];

const fullConsentText = `Apha Health Plan is a privately owned website and is not affiliated with or endorsed by any state or Federal government, the Centers for Medicare & Medicaid Services (CMS), Healthcare.gov, the Department of Health and Human Services, or the federal Medicare program. Apha Health Plan is not an insurer and does not offer every plan available in your area. Plan availability varies by ZIP code, eligibility, carrier participation, and contract status. For complete information about Medicare options, visit Medicare.gov, call 1-800-MEDICARE (TTY: 1-877-486-2048) 24 hours a day, 7 days a week, or contact your local State Health Insurance Assistance Program (SHIP). By submitting this form or calling the listed number, you agree that a licensed insurance agent or insurance company may contact you by phone, text, or email about Medicare Advantage, Medicare Supplement, or Prescription Drug Plan options. Enrollment may be limited to certain times of the year unless you qualify for a Special Enrollment Period or are in your Medicare Initial Election Period. The purpose of this communication is the solicitation of insurance.`;

function generateLeadId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().toUpperCase();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, (char) => {
      const random = Math.floor(Math.random() * 16);
      const value = char === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    })
    .toUpperCase();
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-[#062a3c] shadow-[0_18px_38px_rgba(6,42,60,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(94,234,212,0.9),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.18),transparent)]" />
        <span className="relative text-lg font-black tracking-[-0.08em] text-white">AH</span>
      </div>
      <div className="leading-none">
        <p className="text-base font-black tracking-[-0.04em] text-[#082033]">Apha</p>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#4f7c83]">Health Plan</p>
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#128a8f]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.055em] text-[#082033] sm:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-[#5e7280]">{copy}</p>
    </div>
  );
}

function AnimatedPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`apha-rise ${className}`}>{children}</div>;
}

export default function Home() {
  const consentTextVersion = 'apha-v1.0';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormFieldName, string>>>({});
  const [leadIdToken, setLeadIdToken] = useState('');
  const [submissionAlert, setSubmissionAlert] = useState<SubmissionAlertState>({
    open: false,
    title: '',
    message: '',
    variant: 'success',
  });
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    setLeadIdToken(generateLeadId());
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (!Object.prototype.hasOwnProperty.call(formData, name)) {
      return;
    }

    const fieldName = name as FormFieldName;

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setFieldErrors((prev) => {
      if (!prev[fieldName]) {
        return prev;
      }

      const next = { ...prev };
      if (value.trim()) {
        delete next[fieldName];
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFieldErrors = requiredFields.reduce<Partial<Record<FormFieldName, string>>>((errors, field) => {
      if (!formData[field.name].trim()) {
        errors[field.name] = `${field.label} is required.`;
      }
      return errors;
    }, {});

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSubmissionAlert({
        open: true,
        title: 'A few details are missing',
        message: 'Please add your first name, last name, phone number, and ZIP code before sending your request.',
        variant: 'error',
      });
      return;
    }

    setFieldErrors({});

    if (!consentChecked) {
      setConsentError('Please review and accept the communication consent before continuing.');
      return;
    }

    const leadIdTokenValue = leadIdToken.trim();

    if (!leadIdTokenValue) {
      setSubmissionAlert({
        open: true,
        title: 'Secure tracking token unavailable',
        message: 'Please refresh the page so we can create a complete request record.',
        variant: 'error',
      });
      return;
    }

    const payload = {
      formType: 'medicare_contact',
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      serviceInterest: 'Apha Medicare guidance consultation',
      message: `Consultation requested for ZIP code ${formData.zipCode}.`,
      consent_checked: true,
      consent_timestamp: new Date().toISOString(),
      consent_text_version: consentTextVersion,
      leadiD_token: leadIdTokenValue,
      page_url: window.location.href,
      page_source: 'Apha Health Plan landing page',
    };

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmissionAlert({
        open: true,
        title: 'Your consultation request is in',
        message: 'Thank you. A licensed insurance professional may contact you shortly to discuss available options.',
        variant: 'success',
      });

      setFormData(initialFormData);
      setLeadIdToken(generateLeadId());
      setConsentChecked(false);
      setConsentError('');
    } catch {
      setSubmissionAlert({
        open: true,
        title: 'We could not send the request',
        message: 'Please try again in a moment or call us directly for assistance.',
        variant: 'error',
      });
    }
  };

  const inputBase =
    'mt-2 w-full rounded-2xl border bg-white/90 px-4 py-3.5 text-[#082033] shadow-sm outline-none transition duration-300 placeholder:text-[#8da1ad] focus:-translate-y-0.5 focus:border-[#16a3a8] focus:ring-4 focus:ring-[#7dd3fc]/20';

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6fafb] text-[#082033] selection:bg-[#9ee7e3] selection:text-[#062a3c]">
      <PremiumSubmissionAlert
        open={submissionAlert.open}
        title={submissionAlert.title}
        message={submissionAlert.message}
        variant={submissionAlert.variant}
        onClose={() => setSubmissionAlert((prev) => ({ ...prev, open: false }))}
      />

      <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#90f0e3]/40 blur-3xl" />
        <div className="absolute right-[-12rem] top-56 h-[34rem] w-[34rem] rounded-full bg-[#b8d7ff]/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#d9f99d]/25 blur-3xl" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
        <nav className="mx-auto max-w-7xl rounded-[1.7rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_24px_70px_rgba(8,32,51,0.10)] backdrop-blur-2xl sm:px-6">
          <div className="flex items-center justify-between gap-5">
            <Link href="/" aria-label="Apha Health Plan home">
              <BrandMark />
            </Link>

            <div className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm font-semibold text-[#526b78] transition hover:text-[#082033]">
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <a href="tel:+12029848556" className="text-sm font-bold text-[#0a5962]">
                (202) 984-8556
              </a>
              <a
                href="#consultation"
                className="group inline-flex items-center gap-2 rounded-full bg-[#062a3c] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_34px_rgba(6,42,60,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0b3b53]"
              >
                Start review <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
            </div>

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl border border-[#d7e8ec] bg-white text-[#082033] shadow-sm lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen ? (
            <div className="mt-4 rounded-[1.35rem] border border-[#dcebed] bg-white p-3 lg:hidden">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-[#526b78] hover:bg-[#f0f8f9]"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#consultation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-[#062a3c] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Request a private review
                </a>
              </div>
            </div>
          ) : null}
        </nav>
      </header>

      <main className="relative z-10">
        <section className="relative px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pb-28 lg:pt-44">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <AnimatedPanel className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe8e6] bg-white/75 px-4 py-2 text-sm font-bold text-[#0b6f75] shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#13a8a3]" /> Modern Medicare guidance, designed around you
              </div>
              <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-[-0.075em] text-[#082033] sm:text-6xl lg:text-7xl">
                Health plan decisions, made calmer and clearer.
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-9 text-[#5e7280]">
                Apha Health Plan pairs elegant technology with human insurance support to help you understand Medicare choices, compare coverage paths, and prepare for enrollment conversations with confidence.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#consultation"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#062a3c] px-7 py-4 text-base font-bold text-white shadow-[0_22px_42px_rgba(6,42,60,0.22)] transition hover:-translate-y-1 hover:bg-[#0b3b53]"
                >
                  Begin my coverage review <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </a>
                <a
                  href="#process"
                  className="inline-flex items-center justify-center rounded-full border border-[#cfe4e8] bg-white/80 px-7 py-4 text-base font-bold text-[#0a5962] shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-[#8fd4d1] hover:bg-white"
                >
                  See how Apha works
                </a>
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  ['Licensed', 'agent access'],
                  ['ZIP-based', 'plan context'],
                  ['No-cost', 'consultation request'],
                ].map(([top, bottom]) => (
                  <div key={top} className="rounded-3xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                    <p className="text-lg font-black tracking-[-0.04em] text-[#082033]">{top}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6a828d]">{bottom}</p>
                  </div>
                ))}
              </div>
            </AnimatedPanel>

            <AnimatedPanel className="relative min-h-[620px] lg:min-h-[680px]">
              <div className="absolute inset-x-8 top-10 h-[34rem] rounded-[3.5rem] bg-gradient-to-br from-[#d7fffb] via-white to-[#dbeafe] shadow-[0_40px_120px_rgba(8,32,51,0.14)]" />
              <div className="absolute right-4 top-0 h-40 w-40 rounded-full bg-[#56d5cd]/30 blur-2xl" />
              <div className="absolute left-2 top-20 z-10 rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-[0_28px_70px_rgba(8,32,51,0.12)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7fbf7] text-[#0c8c87]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#082033]">Coverage confidence</p>
                    <p className="text-xs font-semibold text-[#6a828d]">Guided by clear priorities</p>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 top-16 z-20 w-[88%] -translate-x-1/2 rounded-[2.2rem] border border-white/90 bg-white/90 p-5 shadow-[0_35px_90px_rgba(8,32,51,0.16)] backdrop-blur-2xl sm:w-[76%]">
                <div className="rounded-[1.6rem] bg-[#062a3c] p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9ee7e3]">Apha Plan Studio</p>
                      <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">Personal Medicare snapshot</h3>
                    </div>
                    <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Live review</div>
                  </div>
                  <div className="mt-7 grid gap-3">
                    {[
                      ['Prescription fit', '92%'],
                      ['Provider alignment', 'In review'],
                      ['Enrollment timing', 'Window check'],
                    ].map(([label, value], index) => (
                      <div key={label} className="rounded-2xl bg-white/10 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-white/80">{label}</span>
                          <span className="font-black">{value}</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#5eead4] to-[#bfdbfe]"
                            style={{ width: `${index === 0 ? 92 : index === 1 ? 63 : 78}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-[1.5rem] border border-[#e1eef0] bg-[#f7fcfc] p-4">
                    <Hospital className="h-5 w-5 text-[#0d9488]" />
                    <p className="mt-4 text-2xl font-black tracking-[-0.05em]">3</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a828d]">Plan categories</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#e1eef0] bg-[#f7fcfc] p-4">
                    <CircleDollarSign className="h-5 w-5 text-[#0d9488]" />
                    <p className="mt-4 text-2xl font-black tracking-[-0.05em]">$0</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a828d]">Review request</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-16 right-0 z-30 w-72 rounded-[2rem] border border-white/90 bg-white/85 p-5 shadow-[0_28px_80px_rgba(8,32,51,0.14)] backdrop-blur-xl">
                <div className="flex items-center -space-x-3">
                  {['MA', 'DR', 'ET'].map((initials, index) => (
                    <div
                      key={initials}
                      className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-[#dff8f4] text-xs font-black text-[#0a5962]"
                      style={{ backgroundColor: index === 1 ? '#e7f0ff' : index === 2 ? '#f0fdf4' : undefined }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm font-bold leading-6 text-[#082033]">Members and caregivers use Apha to organize Medicare conversations before they enroll.</p>
              </div>
            </AnimatedPanel>
          </div>
        </section>

        <section id="coverage" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Coverage support"
              title="A premium way to compare Medicare and insurance options."
              copy="Instead of overwhelming you with generic plan cards, Apha organizes your decision around the details that can change your healthcare experience."
            />

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {coverageFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <AnimatedPanel
                    key={feature.title}
                    className={`group rounded-[2.4rem] border border-white/80 bg-white/80 p-7 shadow-[0_24px_70px_rgba(8,32,51,0.08)] backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_34px_90px_rgba(8,32,51,0.13)] ${
                      index === 1 ? 'lg:mt-10' : ''
                    }`}
                  >
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e5fbf8] text-[#0d9488] transition group-hover:scale-110">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#128a8f]">{feature.eyebrow}</p>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.05em] text-[#082033]">{feature.title}</h3>
                    <p className="mt-4 leading-7 text-[#5e7280]">{feature.copy}</p>
                    <div className="mt-7 space-y-3">
                      {feature.points.map((point) => (
                        <div key={point} className="flex items-center gap-3 text-sm font-bold text-[#31515e]">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#effaf9] text-[#0d9488]">
                            <Check className="h-4 w-4" />
                          </span>
                          {point}
                        </div>
                      ))}
                    </div>
                  </AnimatedPanel>
                );
              })}
            </div>
          </div>
        </section>

        <section id="why-apha" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 rounded-[3rem] border border-white/80 bg-[#062a3c] p-6 shadow-[0_38px_100px_rgba(6,42,60,0.22)] sm:p-10 lg:grid-cols-[0.82fr_1.18fr] lg:p-14">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#6ee7dd]">Why Apha</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">Healthcare guidance that feels refined, not rushed.</h2>
              <p className="mt-6 text-lg leading-8 text-[#c6d9df]">
                Apha Health Plan is built for people who want Medicare guidance with the clarity of a modern product and the warmth of a trusted conversation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.1]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#6ee7dd]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-black tracking-[-0.04em] text-white">{pillar.title}</h3>
                    <p className="mt-3 leading-7 text-[#c6d9df]">{pillar.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="process" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="The Apha flow"
              title="Four clear steps from confusion to an informed next move."
              copy="Our workflow keeps the experience structured while leaving room for your real healthcare needs, family questions, and timing concerns."
            />
            <div className="relative mt-16 grid gap-5 lg:grid-cols-4">
              <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[#9cdad8] to-transparent lg:block" />
              {processSteps.map((item) => (
                <div key={item.step} className="relative rounded-[2.1rem] border border-[#dcebed] bg-white/85 p-6 shadow-[0_18px_55px_rgba(8,32,51,0.07)] backdrop-blur">
                  <div className="grid h-20 w-20 place-items-center rounded-[1.7rem] bg-gradient-to-br from-[#e4fbf8] to-[#eef5ff] text-2xl font-black tracking-[-0.06em] text-[#0a5962] shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="mt-7 text-xl font-black tracking-[-0.04em] text-[#082033]">{item.title}</h3>
                  <p className="mt-3 leading-7 text-[#5e7280]">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Member perspective"
              title="Designed for people who want better conversations about coverage."
              copy="Every detail is shaped to feel calm, polished, and useful for Medicare shoppers and the families who support them."
            />
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-[2.3rem] border border-white/80 bg-white/85 p-7 shadow-[0_24px_70px_rgba(8,32,51,0.08)] backdrop-blur">
                  <div className="flex gap-1 text-[#0d9488]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Sparkles key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-7 text-lg leading-8 text-[#254653]">“{testimonial.quote}”</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#dff8f4] to-[#e7f0ff] text-sm font-black text-[#0a5962]">
                      {testimonial.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-black text-[#082033]">{testimonial.name}</p>
                      <p className="text-sm font-semibold text-[#6a828d]">{testimonial.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="consultation" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[3rem] bg-gradient-to-br from-[#062a3c] via-[#0a3a4e] to-[#0f766e] p-8 text-white shadow-[0_38px_100px_rgba(6,42,60,0.22)] sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#9ee7e3]">Private consultation request</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] sm:text-5xl">Ready for a clearer plan conversation?</h2>
              <p className="mt-6 text-lg leading-8 text-[#d8eef0]">
                Share a few details and we will help initiate a guided review. A licensed insurance professional may contact you to discuss Medicare plan information available in your area.
              </p>
              <div className="mt-10 space-y-4">
                {['Medicare Advantage, Supplement, and Part D context', 'Licensed agent consultation support', 'Enrollment timing and next-step organization'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-bold text-white backdrop-blur">
                    <Check className="h-5 w-5 text-[#9ee7e3]" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-10 rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9ee7e3]">Contact</p>
                <div className="mt-5 space-y-4 text-[#edfafa]">
                  <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-[#9ee7e3]" /> +1 (202) 984-8556</p>
                  <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-[#9ee7e3]" /> hello@aphahealthplan.com</p>
                  <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-[#9ee7e3]" /> 1500 N Grant St STE R Denver, CO 80203 United States</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[3rem] border border-white/90 bg-white/90 p-6 shadow-[0_28px_85px_rgba(8,32,51,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
              <input id="leadid_token" name="universal_leadid" type="hidden" value={leadIdToken} readOnly />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#128a8f]">Secure intake</p>
                  <h3 className="mt-2 text-3xl font-black tracking-[-0.055em] text-[#082033]">Tell us where to begin.</h3>
                </div>
                <div className="hidden rounded-full bg-[#effaf9] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0a5962] sm:block">Encrypted-ready</div>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="text-sm font-black text-[#254653]">First name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    autoComplete="given-name"
                    aria-invalid={fieldErrors.firstName ? 'true' : 'false'}
                    className={`${inputBase} ${fieldErrors.firstName ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-[#d7e8ec]'}`}
                  />
                  {fieldErrors.firstName ? <p className="mt-2 text-sm font-semibold text-red-600">{fieldErrors.firstName}</p> : null}
                </div>
                <div>
                  <label htmlFor="lastName" className="text-sm font-black text-[#254653]">Last name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    autoComplete="family-name"
                    aria-invalid={fieldErrors.lastName ? 'true' : 'false'}
                    className={`${inputBase} ${fieldErrors.lastName ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-[#d7e8ec]'}`}
                  />
                  {fieldErrors.lastName ? <p className="mt-2 text-sm font-semibold text-red-600">{fieldErrors.lastName}</p> : null}
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="text-sm font-black text-[#254653]">Phone number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    aria-invalid={fieldErrors.phone ? 'true' : 'false'}
                    className={`${inputBase} ${fieldErrors.phone ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-[#d7e8ec]'}`}
                  />
                  {fieldErrors.phone ? <p className="mt-2 text-sm font-semibold text-red-600">{fieldErrors.phone}</p> : null}
                </div>
                <div>
                  <label htmlFor="zipCode" className="text-sm font-black text-[#254653]">ZIP code *</label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    aria-invalid={fieldErrors.zipCode ? 'true' : 'false'}
                    className={`${inputBase} ${fieldErrors.zipCode ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-[#d7e8ec]'}`}
                  />
                  {fieldErrors.zipCode ? <p className="mt-2 text-sm font-semibold text-red-600">{fieldErrors.zipCode}</p> : null}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="email" className="text-sm font-black text-[#254653]">Email address <span className="font-semibold text-[#6a828d]">(optional)</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  className={`${inputBase} border-[#d7e8ec]`}
                />
              </div>

              <div className={`mt-6 rounded-[1.6rem] border p-5 ${consentError ? 'border-red-300 bg-red-50' : 'border-[#d7e8ec] bg-[#f7fcfc]'}`}>
                <label htmlFor="consent" className="flex items-start gap-4 text-sm leading-6 text-[#4f6875]">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(event) => {
                      setConsentChecked(event.target.checked);
                      if (event.target.checked) {
                        setConsentError('');
                      }
                    }}
                    className="mt-1 h-5 w-5 rounded border-[#9fb9c1] text-[#0d9488] accent-[#0d9488]"
                  />
                  <span>{fullConsentText}</span>
                </label>
                {consentError ? <p className="mt-3 text-sm font-semibold text-red-600">{consentError}</p> : null}
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#062a3c] px-7 py-4 text-base font-black text-white shadow-[0_22px_42px_rgba(6,42,60,0.22)] transition hover:-translate-y-1 hover:bg-[#0b3b53]"
              >
                Send my consultation request <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <SectionIntro
              eyebrow="Questions"
              title="Helpful answers before you begin."
              copy="Apha keeps Medicare guidance straightforward, compliant, and grounded in your personal coverage priorities."
            />
            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-[1.7rem] border border-[#dcebed] bg-white/85 p-6 shadow-sm backdrop-blur">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black tracking-[-0.03em] text-[#082033]">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#0d9488] transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 leading-7 text-[#5e7280]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-[#082033] p-8 shadow-[0_38px_100px_rgba(6,42,60,0.22)] sm:p-12 lg:p-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#6ee7dd]">A calmer start</p>
                <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">Build your Medicare plan conversation on clarity.</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#c6d9df]">Request a guided review and move forward with coverage questions organized around what matters most to you.</p>
              </div>
              <a
                href="#consultation"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-black text-[#082033] shadow-[0_24px_60px_rgba(255,255,255,0.12)] transition hover:-translate-y-1 hover:bg-[#e9fffc]"
              >
                Open the secure form <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#dcebed] bg-white/75 px-4 py-14 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <BrandMark />
              <p className="mt-6 max-w-md leading-7 text-[#5e7280]">Apha Health Plan helps Medicare shoppers and caregivers organize plan questions, compare coverage considerations, and request licensed insurance guidance.</p>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#128a8f]">Explore</p>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-[#526b78]">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href} className="hover:text-[#082033]">{item.label}</a>
                ))}
                <Link href="/privacy-policy" className="hover:text-[#082033]">Privacy Policy</Link>
                <Link href="/terms-of-service" className="hover:text-[#082033]">Terms of Service</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#128a8f]">Reach us</p>
              <div className="mt-5 space-y-3 text-sm font-semibold text-[#526b78]">
                <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#0d9488]" /> +1 (202) 984-8556</p>
                <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#0d9488]" /> hello@aphahealthplan.com</p>
                <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-[#0d9488]" /> 1500 N Grant St STE R Denver, CO 80203 United States</p>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-[#dcebed] pt-8">
            <p className="text-xs leading-6 text-[#6a828d]">
              © 2026 Apha Health Plan. All rights reserved. Apha Health Plan is a privately owned, non-government website and is not connected with or endorsed by Medicare, CMS, Healthcare.gov, or any government agency. Plan information and availability vary by area, carrier, eligibility, and enrollment period.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
