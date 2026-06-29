"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { PremiumSubmissionAlert } from "@/components/PremiumSubmissionAlert";
import {
  buildLeadIdSubmissionSnapshot,
  getCanonicalLeadIdInput,
  getLeadIdDebugState,
  leadIdLog,
  markLeadIdSubmission,
  readCurrentLeadIdToken,
  waitForValidLeadIdToken,
} from "@/lib/leadid-browser";
import {
  isValidLeadiDToken,
  LEADID_FIELD_NAME,
  LEADID_FORM_FIELD_ID,
} from "@/lib/leadid";

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
  variant: "success" | "error";
};

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  phone: "",
  zipCode: "",
  email: "",
};

const requiredFields = [
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "phone", label: "Phone Number" },
  { name: "zipCode", label: "Zip Code" },
] as const satisfies ReadonlyArray<{
  name: Exclude<FormFieldName, "email">;
  label: string;
}>;

const fullConsentText = `By checking this box and submitting this form, I consent to be contacted by Alpha Legal Intake and its law firm or intake partners by phone, email, text message, or prerecorded/artificial voice at the number and email I provided, including through automated dialing technology, about motor vehicle accident and personal injury legal intake services. I understand my consent is not required to purchase services, message and data rates may apply, and I can opt out at any time. I certify that the information submitted is accurate and that I am at least 18 years old.`;

const services = [
  {
    title: "MVA Lead Generation",
    description:
      "Connect with claimants who are actively seeking help after motor vehicle accidents.",
  },
  {
    title: "Live Transfer Calls",
    description:
      "Receive warm, real-time calls from screened prospects ready to discuss their accident details.",
  },
  {
    title: "Personal Injury Intake",
    description:
      "Use a compliant intake flow that captures key case details for fast law firm review.",
  },
];

const processSteps = [
  "Submit your intake request and campaign goals.",
  "We verify contact details, location, and accident interest.",
  "Qualified prospects are routed to your intake team or call center.",
  "Your firm reviews case fit and follows up with confidence.",
];

const faqs = [
  {
    question: "What types of cases does Alpha Legal Intake support?",
    answer:
      "We focus on motor vehicle accident and personal injury intake opportunities for law firms and legal marketers.",
  },
  {
    question: "Can leads be delivered as live transfers?",
    answer:
      "Yes. Alpha Legal Intake can support live transfer workflows so your intake team can speak with interested prospects quickly.",
  },
  {
    question: "Is consent captured on the intake form?",
    answer:
      "Yes. The homepage form keeps the existing LeadiD verification flow and records the displayed legal-intake consent language.",
  },
];

function ContactDetails({
  className = "",
  iconClassName = "h-5 w-5",
  textClassName = "text-sm text-slate-700",
}: {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-teal-600">
        Alpha Legal Intake
      </p>
      <div className={`space-y-3 ${textClassName}`}>
        <p className="flex items-center gap-3">
          <Phone className={`${iconClassName} shrink-0 text-teal-600`} />
          <span>+1 (202) 984-8556</span>
        </p>
        <p className="flex items-center gap-3">
          <Mail className={`${iconClassName} shrink-0 text-teal-600`} />
          <span>hello@alphalegalintake.com</span>
        </p>
        <p className="flex items-start gap-3">
          <MapPin
            className={`${iconClassName} mt-0.5 shrink-0 text-teal-600`}
          />
          <span>1500 N Grant St STE R Denver, CO 80203 United States</span>
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const consentTextVersion = "legal-intake-v1.0";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadIdReady, setLeadIdReady] = useState(false);
  const [leadIdStatusMessage, setLeadIdStatusMessage] = useState(
    "Initializing secure lead verification…",
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormFieldName, string>>
  >({});
  const [submissionAlert, setSubmissionAlert] = useState<SubmissionAlertState>({
    open: false,
    title: "",
    message: "",
    variant: "success",
  });
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    let cancelled = false;

    const updateLeadIdStatus = () => {
      const token = readCurrentLeadIdToken();
      const ready = isValidLeadiDToken(token);

      if (cancelled) {
        return;
      }

      setLeadIdReady(ready);

      if (ready) {
        setLeadIdStatusMessage("Secure lead verification ready.");
        return;
      }

      const state = getLeadIdDebugState();
      const elapsedMs =
        Date.now() - new Date(state.session.pageLoadedAt).getTime();
      if (elapsedMs > 10_000) {
        setLeadIdStatusMessage(
          "Lead verification token is still missing. Disable ad blockers or browser tracking protection, then reload the page.",
        );
        return;
      }

      setLeadIdStatusMessage("Initializing secure lead verification…");
    };

    updateLeadIdStatus();
    const intervalId = window.setInterval(updateLeadIdStatus, 500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
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

    if (isSubmitting) {
      return;
    }

    const nextFieldErrors = requiredFields.reduce<
      Partial<Record<FormFieldName, string>>
    >((errors, field) => {
      if (!formData[field.name].trim()) {
        errors[field.name] = `${field.label} is required.`;
      }
      return errors;
    }, {});

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSubmissionAlert({
        open: true,
        title: "Complete Required Fields",
        message:
          "Please fill in First Name, Last Name, Phone Number, and Zip Code before submitting the form.",
        variant: "error",
      });
      return;
    }

    setFieldErrors({});

    if (!consentChecked) {
      setConsentError("Consent is required before submitting this form.");
      return;
    }

    setIsSubmitting(true);
    const leadiDToken = await waitForValidLeadIdToken();

    if (!leadiDToken) {
      setSubmissionAlert({
        open: true,
        title: "Lead ID Missing",
        message:
          "The LeadiD token was not generated. Please refresh the page and try again.",
        variant: "error",
      });
      setIsSubmitting(false);
      return;
    }

    leadIdLog("submit using token", { token: leadiDToken });
    markLeadIdSubmission(leadiDToken);

    const payload = {
      formType: "alpha_legal_intake",
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      zipCode: formData.zipCode,
      serviceInterest: "Motor Vehicle Accident Leads",
      message: "",
      consent_checked: true,
      consent_timestamp: new Date().toISOString(),
      consent_text_version: consentTextVersion,
      leadid_token: leadiDToken,
      page_url: window.location.href,
      page_source: "alpha legal intake landing form",
      leadid_debug: buildLeadIdSubmissionSnapshot(),
    };

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmissionAlert({
        open: true,
        title: "Request Submitted",
        message: "Thank you. Alpha Legal Intake will contact you soon.",
        variant: "success",
      });

      setFormData(initialFormData);
      setConsentChecked(false);
      setConsentError("");
      const canonicalInput = getCanonicalLeadIdInput();
      if (canonicalInput) {
        canonicalInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } catch {
      setSubmissionAlert({
        open: true,
        title: "Submission Failed",
        message:
          "We could not submit your request right now. Please try again shortly.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="alpha-site min-h-screen pt-20">
      <PremiumSubmissionAlert
        open={submissionAlert.open}
        title={submissionAlert.title}
        message={submissionAlert.message}
        variant={submissionAlert.variant}
        onClose={() => setSubmissionAlert((prev) => ({ ...prev, open: false }))}
      />

      <nav className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="alpha-floating-header mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-slate-900"
            aria-label="Alpha Legal Intake home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#062032] text-[#11c5ba]">
              <Scale className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">Alpha Legal Intake</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#services"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Services
            </a>
            <a
              href="#why-alpha"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Why Alpha
            </a>
            <a
              href="#process"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Process
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="alpha-primary-button px-5 py-2 text-sm font-bold"
            >
              Request MVA leads
            </a>
          </div>

          <button
            type="button"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-sky-100 bg-white/95 px-4 py-3 shadow-lg md:hidden">
            <div className="flex flex-col gap-3">
              {["services", "why-alpha", "process", "faq", "contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm capitalize text-slate-700"
                  >
                    {item.replace("-", " ")}
                  </a>
                ),
              )}
            </div>
          </div>
        ) : null}
      </nav>

      <section className="alpha-soft-gradient py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="space-y-7">
            <p className="alpha-eyebrow inline-flex rounded-full border border-teal-200 bg-white/70 px-4 py-2">
              Alpha Legal Intake
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-[#062032] md:text-6xl">
              Qualified Motor Vehicle Accident Leads for Law Firms
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Grow your personal injury practice with screened MVA inquiries,
              consent-based intake, and fast routing to your legal team.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="alpha-primary-button inline-flex items-center justify-center gap-2 px-7 py-3 font-bold"
              >
                Request MVA leads <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="tel:+12029848556"
                className="alpha-secondary-button inline-flex items-center justify-center px-7 py-3 font-semibold"
              >
                Call +1 (202) 984-8556
              </a>
            </div>
          </div>
          <div className="alpha-card p-6">
            <div className="rounded-[1.5rem] bg-white p-6 text-slate-950">
              <p className="alpha-eyebrow">Intake snapshot</p>
              <h2 className="mt-3 text-2xl font-black">
                Personal injury demand, routed with clarity.
              </h2>
              <div className="mt-6 space-y-4">
                {[
                  "Accident-focused prospects",
                  "Live transfer-ready workflows",
                  "Consent and LeadiD verification retained",
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-stone-100 p-4 text-sm font-semibold"
                  >
                    <ShieldCheck className="h-5 w-5 text-teal-600" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="alpha-eyebrow">Services</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Legal intake channels built for injury firms.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="alpha-rounded-card p-7">
                <CheckCircle2 className="h-7 w-7 text-teal-600" />
                <h3 className="mt-5 text-xl font-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why-alpha" className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="alpha-eyebrow">Why Alpha</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              A focused intake partner for serious personal injury growth.
            </h2>
          </div>
          <div className="space-y-4 text-slate-600">
            <p>
              Alpha Legal Intake helps law firms reduce wasted follow-up time by
              aligning lead generation, consent capture, and intake routing
              around motor vehicle accident prospects.
            </p>
            <p>
              Our process emphasizes speed, clear case context, and dependable
              contact information so your team can prioritize the opportunities
              that fit your practice.
            </p>
          </div>
        </div>
      </section>

      <section id="process" className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="alpha-eyebrow">Process</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Four steps from request to intake.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step} className="alpha-rounded-card p-6">
                <span className="text-4xl font-black text-teal-600">
                  0{index + 1}
                </span>
                <p className="mt-5 text-sm font-semibold leading-6 text-slate-700">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="alpha-cta-panel mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="flex justify-center gap-1 text-teal-300">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <blockquote className="mt-6 text-2xl font-bold leading-10">
            “Alpha Legal Intake gives our team a cleaner starting point:
            accident-focused prospects, faster conversations, and the details we
            need to evaluate fit.”
          </blockquote>
          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-teal-200">
            Client perspective
          </p>
        </div>
      </section>

      <section id="contact" className="py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="alpha-eyebrow">Start intake</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Request qualified MVA lead support.
            </h2>
            <p className="mt-4 text-slate-600">
              Complete the form and Alpha Legal Intake will follow up about your
              motor vehicle accident lead goals.
            </p>
            <ContactDetails
              className="alpha-card mt-8 p-6"
              iconClassName="h-4 w-4"
              textClassName="text-sm text-slate-700"
            />
          </div>

          <div className="alpha-card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                id={LEADID_FORM_FIELD_ID}
                name={LEADID_FIELD_NAME}
                data-leadid-mirror="true"
                type="hidden"
                defaultValue=""
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm font-medium text-slate-800"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    autoComplete="given-name"
                    aria-invalid={fieldErrors.firstName ? "true" : "false"}
                    className={`w-full rounded-md border px-3 py-2 transition focus:outline-none focus:ring-2 ${fieldErrors.firstName ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"}`}
                  />
                  {fieldErrors.firstName ? (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.firstName}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm font-medium text-slate-800"
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    autoComplete="family-name"
                    aria-invalid={fieldErrors.lastName ? "true" : "false"}
                    className={`w-full rounded-md border px-3 py-2 transition focus:outline-none focus:ring-2 ${fieldErrors.lastName ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"}`}
                  />
                  {fieldErrors.lastName ? (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.lastName}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-slate-800"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    aria-invalid={fieldErrors.phone ? "true" : "false"}
                    className={`w-full rounded-md border px-3 py-2 transition focus:outline-none focus:ring-2 ${fieldErrors.phone ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"}`}
                  />
                  {fieldErrors.phone ? (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.phone}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="zipCode"
                    className="mb-1 block text-sm font-medium text-slate-800"
                  >
                    Zip Code *
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    aria-invalid={fieldErrors.zipCode ? "true" : "false"}
                    className={`w-full rounded-md border px-3 py-2 transition focus:outline-none focus:ring-2 ${fieldErrors.zipCode ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-teal-500 focus:ring-teal-100"}`}
                  />
                  {fieldErrors.zipCode ? (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.zipCode}
                    </p>
                  ) : null}
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-slate-800"
                >
                  Email (Optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div
                className={`rounded-md border p-4 ${consentError ? "border-red-400 bg-red-50" : "border-stone-300 bg-stone-50"}`}
              >
                <label
                  htmlFor="leadid_tcpa_disclosure"
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <input
                    id="leadid_tcpa_disclosure"
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(event) => {
                      setConsentChecked(event.target.checked);
                      if (event.target.checked) {
                        setConsentError("");
                      }
                    }}
                    className="mt-1 h-4 w-4"
                  />
                  <span>{fullConsentText}</span>
                </label>
                {consentError ? (
                  <p className="mt-2 text-sm text-red-600">{consentError}</p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={!leadIdReady || isSubmitting}
                className="alpha-primary-button w-full px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting…" : "Request MVA leads"}
              </button>
              <p
                className={`text-sm ${leadIdReady ? "text-emerald-700" : "text-teal-700"}`}
              >
                {leadIdStatusMessage}
              </p>
            </form>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="alpha-eyebrow">FAQ</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Common questions.
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-stone-200 p-6"
              >
                <h3 className="font-black">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="alpha-cta-panel mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-center lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em]">
              Final CTA
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Ready to discuss your intake goals?
            </h2>
          </div>
          <a
            href="#contact"
            className="rounded-full bg-white px-7 py-3 font-bold text-[#062032] transition hover:bg-teal-50"
          >
            Start intake
          </a>
        </div>
      </section>

      <footer className="mt-16 bg-[#062032] py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="text-lg font-black">Alpha Legal Intake</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Qualified motor vehicle accident lead generation and personal
              injury intake support.
            </p>
          </div>
          <div>
            <p className="font-bold">Explore</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
              <a href="#services" className="hover:text-white">
                Services
              </a>
              <a href="#why-alpha" className="hover:text-white">
                Why Alpha
              </a>
              <a href="#process" className="hover:text-white">
                Process
              </a>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
          <div>
            <p className="font-bold">Reach Us</p>
            <ContactDetails
              className="mt-4"
              iconClassName="h-4 w-4"
              textClassName="text-sm text-slate-400"
            />
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          &copy; 2026 Alpha Legal Intake. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
