'use client';

import { useState } from 'react';
import { CheckCircle2, Phone, MapPin, Mail } from 'lucide-react';
import { PremiumSubmissionAlert } from '@/components/PremiumSubmissionAlert';

const fullConsentText = `By checking this box and submitting this form, I agree to be contacted by a licensed insurance agent by phone call, text message, and/or email, including by automated dialing technology, about Medicare Advantage, Medicare Supplement, and Prescription Drug Plan options. I understand this website is privately owned and is not affiliated with, endorsed by, or operated by the U.S. government or the federal Medicare program. I understand this is a solicitation of insurance and that my consent is not required to enroll in a plan or to receive services. I understand I can revoke consent at any time.`;

export default function Home() {
  const consentTextVersion = 'v2.0';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [submissionAlert, setSubmissionAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error';
  }>({
    open: false,
    title: '',
    message: '',
    variant: 'success',
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    zipCode: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentChecked) {
      setConsentError('Consent is required before submitting this form.');
      return;
    }

    const payload = {
      formType: 'medicare_contact',
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      serviceInterest: 'Medicare Assistance',
      message: `Zip Code: ${formData.zipCode}`,
      consent_checked: true,
      consent_timestamp: new Date().toISOString(),
      consent_text_version: consentTextVersion,
      page_url: window.location.href,
      page_source: 'medicare landing form',
    };

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSubmissionAlert({
        open: true,
        title: 'Request Submitted',
        message: 'Thank you. A licensed insurance agent will contact you soon.',
        variant: 'success',
      });

      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        zipCode: '',
        email: '',
      });
      setConsentChecked(false);
      setConsentError('');
    } catch {
      setSubmissionAlert({
        open: true,
        title: 'Submission Failed',
        message: 'We could not submit your request right now. Please try again shortly.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <PremiumSubmissionAlert
        open={submissionAlert.open}
        title={submissionAlert.title}
        message={submissionAlert.message}
        variant={submissionAlert.variant}
        onClose={() => setSubmissionAlert((prev) => ({ ...prev, open: false }))}
      />

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="text-lg font-semibold text-slate-800">
            Chatters Health Solution
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#services" className="text-sm text-slate-600 transition hover:text-slate-900">Services</a>
            <a href="#about" className="text-sm text-slate-600 transition hover:text-slate-900">About</a>
            <a href="#contact" className="text-sm text-slate-600 transition hover:text-slate-900">Contact</a>
            <a href="#contact" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              Get Help
            </a>
          </div>

          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-700">Services</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-700">About</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-700">Contact</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">
                Get Help
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      <section className="border-b border-slate-200 bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Non-government Medicare assistance</p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Shop Medicare options with confidence
            </h1>
            <p className="text-lg text-slate-600">
              Get no-obligation help reviewing Medicare Advantage, Medicare Supplement, and Prescription Drug Plan options.
              Speak with a licensed insurance agent today.
            </p>
            <a href="#contact" className="inline-flex rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
              Talk to a Licensed Agent
            </a>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&h=800&fit=crop"
              alt="Care provider helping a senior review medication"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900 md:text-4xl">Medicare Services</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Simple support to help you understand and compare your Medicare options.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              'Medicare Advantage Plan Guidance',
              'Medicare Supplement Plan Assistance',
              'Prescription Drug Plan Support',
              'Enrollment Assistance',
              'Plan Comparison Help',
              'Licensed Agent Consultation',
            ].map((service) => (
              <div key={service} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <h3 className="mt-4 font-semibold text-slate-900">{service}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Personalized, easy-to-understand help based on your needs and ZIP code.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-slate-200 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">About Chatters Health Solution</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-semibold text-slate-900">Who we help</h3>
              <p className="mt-2 text-sm text-slate-600">
                Individuals turning 65, current Medicare beneficiaries, and caregivers seeking plan guidance.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-semibold text-slate-900">How it works</h3>
              <p className="mt-2 text-sm text-slate-600">
                Submit your details, then connect with a licensed insurance agent to review options and next steps.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-semibold text-slate-900">Our goal</h3>
              <p className="mt-2 text-sm text-slate-600">
                Make Medicare decisions easier through clear information and one-on-one support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Contact a Licensed Agent</h2>
            <p className="mt-3 text-slate-600">
              Complete the form and we will connect you with a licensed insurance agent for Medicare help.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-600" /> +1 (202) 984-8556</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /> admin@chattershealthsolutions.com</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> Denver, Colorado</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-800">First Name</label>
                  <input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-800">Last Name</label>
                  <input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-800">Phone Number</label>
                  <input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label htmlFor="zipCode" className="mb-1 block text-sm font-medium text-slate-800">Zip Code</label>
                  <input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-800">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full rounded-md border border-slate-300 px-3 py-2" />
              </div>

              <div className={`rounded-md border p-4 ${consentError ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}>
                <label htmlFor="consent" className="flex items-start gap-3 text-sm text-slate-700">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => {
                      setConsentChecked(e.target.checked);
                      if (e.target.checked) setConsentError('');
                    }}
                    className="mt-1 h-4 w-4"
                  />
                  <span>{fullConsentText}</span>
                </label>
                {consentError ? <p className="mt-2 text-sm text-red-600">{consentError}</p> : null}
              </div>

              <button
                type="submit"
                disabled={!consentChecked}
                className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Get Medicare Help
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-slate-600 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <p>© 2026 Chatters Health Solution. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-900">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900">Terms & Conditions</a>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            This is a privately owned, non-government website. We are not affiliated with or endorsed by Medicare or any government agency.
            Availability of plans varies by ZIP code and carrier participation.
          </p>
        </div>
      </footer>
    </div>
  );
}
