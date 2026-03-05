'use client';

import { useState } from 'react';
import { Phone, Headphones, Zap, MessageSquare, BarChart3, Share2, Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConsentCheckbox, TpmoDisclaimer } from '@/components/ConsentBlock';
import { PremiumSubmissionAlert } from '@/components/PremiumSubmissionAlert';

export default function Home() {
  const consentTextVersion = 'v1.0';
 const tpmoDisclaimerText = `Chatters Health Solutions is a privately owned website and is not associated with any state or Federal government, the Centers for Medicare & Medicaid Services (CMS), Healthcare.gov, or the Department of Health and Human Services. We are not an insurer or a licensed agency.

We do not offer every plan available in your area. Plan availability depends on your resident zip code and participating carriers. For complete information about your options, please visit Medicare.gov, call 1-800-MEDICARE (TTY users: 1-877-486-2048) 24 hours a day, 7 days a week, or contact your local State Health Insurance Assistance Program (SHIP).

Enrollment depends on the plan’s contract renewal with Medicare. Enrollment may be limited to certain times of the year unless you qualify for a Special Enrollment Period or are in your Medicare Initial Election Period.

By completing the contact form above or calling the number listed above, you may be connected with a licensed insurance agent who can answer your questions and provide information about Medicare Advantage, Part D, or Medicare Supplement insurance plans.

Neither Chatters Health Solutions nor its agents are connected with or endorsed by the U.S. government or the federal Medicare program.

Medicare Supplement insurance is available to those age 65 and older enrolled in Medicare. The purpose of this communication is the solicitation of insurance. Contact will be made by an insurance agent/producer or insurance company.`;
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    company: '',
    serviceInterest: 'Lead Generation',
    message: '',
  });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      setConsentError('Consent is required before submitting this form.');
      return;
    }

    const payload = {
      formType: 'home_quote',
      fullName: formData.fullName,
      email: formData.workEmail,
      company: formData.company,
      serviceInterest: formData.serviceInterest,
      message: formData.message,
      consent_checked: true,
      consent_timestamp: new Date().toISOString(),
      consent_text_version: consentTextVersion,
      page_url: window.location.href,
      page_source: 'home quote form',
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
        title: 'Request Received',
        message: 'Thank you. Our solutions architect will reach out within 2 business hours.',
        variant: 'success',
      });
      setFormData({
        fullName: '',
        workEmail: '',
        company: '',
        serviceInterest: 'Lead Generation',
        message: '',
      });
      setConsentChecked(false);
      setConsentError('');
    } catch {
      setSubmissionAlert({
        open: true,
        title: 'Submission Failed',
        message: 'We could not submit your request right now. Please try again in a moment.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <PremiumSubmissionAlert
        open={submissionAlert.open}
        title={submissionAlert.title}
        message={submissionAlert.message}
        variant={submissionAlert.variant}
        onClose={() => setSubmissionAlert((prev) => ({ ...prev, open: false }))}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/85 pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex min-h-16 items-center justify-between gap-3">
            <a href="/" className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 ring-1 ring-orange-300/40">
                <div className="absolute inset-[3px] rounded-[10px] border border-white/25"></div>
                <span className="relative text-[11px] font-extrabold tracking-[0.08em] text-white">CHS</span>
              </div>
              <span className="truncate text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">Chatters Health Solutions</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-400 hover:text-white transition text-sm min-h-11 inline-flex items-center">
                Services
              </a>
              <a href="#why" className="text-gray-400 hover:text-white transition text-sm min-h-11 inline-flex items-center">
                Why Choose Us
              </a>
              <a href="#process" className="text-gray-400 hover:text-white transition text-sm min-h-11 inline-flex items-center">
                Process
              </a>
              <a href="#about" className="text-gray-400 hover:text-white transition text-sm min-h-11 inline-flex items-center">
                About
              </a>
              <a href="/jornaya" className="text-gray-400 hover:text-white transition text-sm min-h-11 inline-flex items-center">
                Jornaya
              </a>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>

            <div className="hidden md:flex">
              <a href="#quote" className="inline-flex min-h-11 items-center rounded bg-orange-500 px-6 text-sm font-semibold text-white transition hover:bg-orange-600">
                Contact Us
              </a>
            </div>

            <button
              type="button"
              className="mobile-menu-toggle md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 text-white transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className="relative block h-6 w-6 overflow-visible">
                <span className={`mobile-menu-line absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1.5 rounded transition-all duration-300 ${mobileMenuOpen ? 'translate-y-0 rotate-45' : ''}`}></span>
                <span className={`mobile-menu-line absolute left-0 top-1/2 h-0.5 w-5 rounded transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`mobile-menu-line absolute left-0 top-1/2 h-0.5 w-5 translate-y-1.5 rounded transition-all duration-300 ${mobileMenuOpen ? 'translate-y-0 -rotate-45' : ''}`}></span>
              </span>
            </button>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-xl">
              {[
                ['#services', 'Services'],
                ['#why', 'Why Choose Us'],
                ['#process', 'Process'],
                ['#about', 'About'],
                ['/jornaya', 'Jornaya'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-300 transition hover:bg-slate-800 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              <a
                href="#quote"
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div className="space-y-8">
              <div className="text-sm font-semibold tracking-wide text-orange-500">SCALE YOUR BUSINESS FASTER</div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05]">
                Reliable, Scalable <span className="text-orange-500">Business</span> Support
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                Empowering your growth with premium lead generation and world-class call center solutions tailored for enterprise excellence.
              </p>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <a href="#quote" className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded bg-orange-500 px-8 text-white font-semibold hover:bg-orange-600 transition">
                  Get a Free Quote
                </a>
                <a href="#services" className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded bg-slate-800 text-white font-semibold hover:bg-slate-700 transition border border-slate-700 px-8">
                  View Services
                </a>
              </div>
            </div>

            <div className="relative h-72 sm:h-80 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" 
                  alt="Modern office space" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur px-4 py-2 rounded border border-slate-700">
                <div className="text-green-400 text-sm font-semibold"> LEAD GROWTH</div>
                <div className="text-white font-bold text-xl">+142%</div>
              </div>
            </div>
          </div>
        </div>

       
            </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 lg:py-28">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Specialized <span className="text-orange-500">Services</span>
            </h2>
            <div className="flex justify-center">
              <div className="w-24 h-1 bg-orange-500 rounded"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: 'Inbound Call Center', description: 'High-quality customer support available 24/7 to ensure your customers always receive immediate assistance.' },
              { icon: Zap, title: 'Lead Generation', description: 'Data-driven outreach strategies designed to find and qualify the perfect prospects for your sales pipeline.' },
              { icon: Share2, title: 'BPO Solutions', description: 'Outsource complex business processes to our expert team and focus on your core strategy.' },
              { icon: MessageSquare, title: 'Digital Marketing', description: 'Comprehensive ad management across all major platforms to drive consistent traffic and conversions.' },
              { icon: Headphones, title: 'Omnichannel Chat', description: 'Engage customers where they are-SMS, WhatsApp, and Web Chat managed from a single dashboard.' },
              { icon: BarChart3, title: 'Data Analytics', description: 'In-depth reporting and performance insights that help you make smarter business decisions.' },
            ].map((service, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 hover:border-orange-500/50 transition group">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-500 transition">
                  <service.icon className="w-6 h-6 text-orange-500 group-hover:text-white transition" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why" className="py-16 md:py-24 lg:py-28 border-t border-slate-800">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Why Chatters Health Solutions is the <span className="text-orange-500">Gold Standard</span>
              </h2>
              <div className="space-y-8 mt-8">
                {[
                  { icon: Share2, title: 'Unmatched Reliability', desc: 'Our infrastructure ensures 99.9% uptime for all call operations and lead delivery systems.' },
                  { icon: Phone, title: 'Global Talent Pool', desc: 'Access to highly trained professionals across multiple time zones and languages.' },
                  { icon: BarChart3, title: 'Compliance & Security', desc: 'Strict adherence to international data protection standards and industry regulations.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <item.icon className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { value: '99%', label: 'CLIENT SATISFACTION' },
                { value: '10M+', label: 'CALLS HANDLED' },
                { value: '24/7', label: 'EXPERT SUPPORT' },
                { value: '500+', label: 'ACTIVE CLIENTS' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="process" className="py-16 md:py-24 lg:py-28 border-t border-slate-800">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to scaling your operations</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Discovery Call', desc: 'We analyze your current bottlenecks and define clear growth objectives.' },
              { step: '2', title: 'Tailored Strategy', desc: 'Our experts design a custom workflow and staffing plan suited for your brand.' },
              { step: '3', title: 'Launch & Scale', desc: 'We go live with continuous monitoring and optimization for maximum ROI.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 rounded-full border-3 border-orange-500 flex items-center justify-center">
                    <span className="text-orange-500 text-3xl font-bold">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Connecting Line */}
          <div className="hidden md:flex justify-between mt-16 relative h-1">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 lg:py-28 border-t border-slate-800">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                About <span className="text-orange-500">Chatters Health Solutions</span>
              </h2>
              <p className="text-gray-400 leading-relaxed">
                We help brands scale with performance-focused lead generation, call operations, and compliant customer acquisition systems built for long-term growth.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Years in Operations', value: '10+' },
                { label: 'Campaigns Managed', value: '1,200+' },
                { label: 'Quality Framework', value: 'Compliance First' },
                { label: 'Client Focus', value: 'Enterprise & Growth' },
              ].map((item, i) => (
                <div key={i} className="rounded-lg border border-slate-700 bg-slate-800/40 p-5">
                  <div className="text-orange-500 font-bold text-lg">{item.value}</div>
                  <div className="text-gray-400 text-sm mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Quote Section */}
      <section id="quote" className="py-16 md:py-24 lg:py-28 border-t border-slate-800">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Ready to <span className="text-orange-500">Accelerate?</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Fill out the form and our solutions architect will reach out within 2 business hours.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Email</div>
                    <a href="mailto:growth@chattershealthsolutions.com" className="text-gray-400 hover:text-orange-500 transition">
                      growth@chattershealthsolutions.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Phone</div>
                    <a href="tel:+18005551234" className="text-gray-400 hover:text-orange-500 transition">
                      +1 (800) 555-MAXIMA
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Office</div>
                    <p className="text-gray-400">Manhattan Corporate HQ, NY</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-orange-500/10 transition">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-orange-500/10 transition">
                  <Linkedin className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-8 border border-slate-700">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Work Email</label>
                  <input
                    type="email"
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    required
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                    />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Acme Inc."
                    required
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition"
                    />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Service Interest</label>
                  <select
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:border-orange-500 focus:outline-none transition"
                    >
                    <option>Lead Generation</option>
                    <option>Call Center</option>
                    <option>BPO Solutions</option>
                    <option>Digital Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your needs..."
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition resize-none"
                  />
                </div>

                <TpmoDisclaimer text={tpmoDisclaimerText} longText={tpmoDisclaimerText} />

                <ConsentCheckbox
                  id="home-consent"
                  checked={consentChecked}
                  onChange={(checked) => {
                    setConsentChecked(checked);
                    if (checked) setConsentError('');
                  }}
                  label="I agree to the TPMO disclaimer and consent to be contacted regarding my inquiry."
                  error={consentError}
                />

                <button
                  type="submit"
                  disabled={!consentChecked}
                  aria-disabled={!consentChecked}
                  className="w-full min-h-11 px-6 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                  Submit Quote Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-16">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 ring-1 ring-orange-300/40">
                  <div className="absolute inset-[3px] rounded-[10px] border border-white/25"></div>
                  <span className="relative text-[11px] font-extrabold tracking-[0.08em] text-white">CHS</span>
                </div>
                <span className="font-bold tracking-tight text-white">Chatters Health Solutions</span>
              </div>
              <p className="text-gray-400 text-sm">The premier global partner for high-volume lead generation and customer experience management.</p>
              <div className="flex gap-4 mt-6">
                <button className="text-gray-400 hover:text-orange-500 transition">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-orange-500 transition">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-orange-500 transition">
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">Lead Generation</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Call Center</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Data Enrichment</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Digital Marketing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">About Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Careers</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Our Process</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Newsroom</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">GDPR</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-500 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Contact Support</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">API Docs</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">Â© 2024 Chatters Health Solutions. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-orange-500 transition text-sm">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-orange-500 transition text-sm">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

