'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

const VALUES = [
  {
    name: "Innovation",
    description: "We continuously push the boundaries of what is possible in RFP management through AI and automation.",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    name: "Collaboration",
    description: "We foster seamless collaboration between teams, making it easier to work together on complex proposals.",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    name: "Excellence",
    description: "We are committed to delivering the highest quality solutions that exceed our customers expectations.",
    icon: (
      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      setIsMenuOpen(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50/30"></div>
        
        {/* Radial gradient accents */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_70%)]"></div>
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_70%)]"></div>
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1),transparent_70%)]"></div>
        </div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-noise mix-blend-soft-light opacity-[0.15]"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <button 
                onClick={() => scrollToSection('hero')} 
                className="-m-1.5 p-1.5 text-2xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                BidFlow
              </button>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
            <div className="hidden lg:flex lg:gap-x-12">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('benefits')} 
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors duration-200"
              >
                Benefits
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors duration-200"
              >
                About
              </button>
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <button 
                onClick={() => router.push('/login')} 
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors duration-200"
              >
                Log in <span aria-hidden="true">→</span>
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="fixed inset-0 z-50">
                <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => {
                        scrollToSection('hero');
                        setIsMenuOpen(false);
                      }} 
                      className="-m-1.5 p-1.5 text-2xl font-bold text-indigo-600"
                    >
                      BidFlow
                    </button>
                    <button
                      type="button"
                      className="-m-2.5 rounded-md p-2.5 text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-6 flow-root">
                    <div className="space-y-2 py-6">
                      <button
                        onClick={() => scrollToSection('features')}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Features
                      </button>
                      <button
                        onClick={() => scrollToSection('benefits')}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Benefits
                      </button>
                      <button
                        onClick={() => scrollToSection('about')}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        About
                      </button>
                    </div>
                    <div className="py-6">
                      <button
                        onClick={() => router.push('/login')}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Log in
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <div className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
              <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Transform Your RFP Process with{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  AI-Powered Insights
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                BidFlow streamlines your RFP management with intelligent automation, real-time analytics, and collaborative tools. Upload RFPs, manage bids, and make data-driven decisions all in one place.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <button
                  onClick={() => scrollToSection('features')}
                  className="btn-primary"
                >
                  See how it works
                </button>
              </div>
            </div>
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <div className="relative">
                  <img
                    src="/images/dashboard-preview.png"
                    alt="BidFlow dashboard preview"
                    className="w-[76rem] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div id="features" className="relative z-10 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to manage RFPs efficiently
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                From document analysis to bid management and analytics, BidFlow provides a complete suite of tools for your RFP process.
              </p>
            </div>

            {/* RFP Upload & Analysis Feature */}
            <div className="mt-16 sm:mt-20 lg:mt-24">
              <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                  <div className="lg:pr-8">
                    <div className="lg:max-w-lg">
                      <h3 className="text-2xl font-semibold leading-7 text-primary-600">
                        Intelligent RFP Analysis
                      </h3>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Upload and analyze RFPs instantly
                      </p>
                      <p className="mt-6 text-lg leading-8 text-gray-600">
                        Our AI-powered system automatically extracts key information, requirements, and deadlines from your RFP documents. Get instant insights and recommendations for your proposal strategy.
                      </p>
                      <div className="mt-8">
                        <ul role="list" className="space-y-4">
                          {[
                            'Automatic document parsing and analysis',
                            'Key requirements extraction',
                            'Deadline tracking and reminders',
                            'Smart categorization and tagging',
                            'Compliance checklist generation',
                          ].map((feature) => (
                            <li key={feature} className="flex gap-x-3">
                              <svg className="h-6 w-5 flex-none text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 lg:mt-0">
                    <div className="relative">
                      <img
                        src="/images/rfp-analysis.png"
                        alt="RFP Analysis Interface"
                        className="w-full rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bid Management Feature */}
            <div className="mt-16">
              <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                  <div className="lg:pr-8 order-last">
                    <div className="lg:max-w-lg">
                      <h3 className="text-2xl font-semibold leading-7 text-secondary-600">
                        Streamlined Bid Management
                      </h3>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Create and track bids effortlessly
                      </p>
                      <p className="mt-6 text-lg leading-8 text-gray-600">
                        Manage your entire bidding process in one place. Create professional proposals, track their status, and collaborate with your team in real-time.
                      </p>
                      <div className="mt-8">
                        <ul role="list" className="space-y-4">
                          {[
                            'Intuitive bid creation interface',
                            'Real-time collaboration tools',
                            'Document version control',
                            'Automated proposal templates',
                            'Bid status tracking and notifications',
                          ].map((feature) => (
                            <li key={feature} className="flex gap-x-3">
                              <svg className="h-6 w-5 flex-none text-secondary-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 lg:mt-0">
                    <div className="relative">
                      <img
                        src="/images/bid-management.png"
                        alt="Bid Management Interface"
                        className="w-full rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Feature */}
            <div className="mt-16">
              <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-glow transition-all duration-300">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                  <div className="lg:pr-8">
                    <div className="lg:max-w-lg">
                      <h3 className="text-2xl font-semibold leading-7 text-accent-600">
                        AI-Powered Analytics
                      </h3>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Make data-driven decisions
                      </p>
                      <p className="mt-6 text-lg leading-8 text-gray-600">
                        Get deep insights into your RFP performance with our advanced analytics. Understand win rates, identify trends, and optimize your bidding strategy.
                      </p>
                      <div className="mt-8">
                        <ul role="list" className="space-y-4">
                          {[
                            'Win rate analysis and predictions',
                            'Competitive intelligence insights',
                            'Performance trend visualization',
                            'AI-generated recommendations',
                            'Custom report generation',
                          ].map((feature) => (
                            <li key={feature} className="flex gap-x-3">
                              <svg className="h-6 w-5 flex-none text-accent-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 lg:mt-0">
                    <div className="relative">
                      <img
                        src="/images/analytics-dashboard.png"
                        alt="Analytics Dashboard"
                        className="w-full rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div id="benefits" className="relative z-10 py-24 sm:py-32">
          <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Why Choose BidFlow
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Experience the advantages of our AI-powered RFP management platform
                </p>
              </div>

              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  <div className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      Time Savings
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">Reduce RFP response time by up to 60% with AI-powered document analysis and automated workflows.</p>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                      </svg>
                      Higher Win Rates
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">Improve your win rate by 40% with data-driven insights and competitive analysis.</p>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                      Streamlined Process
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">Centralize your RFP management with real-time collaboration and automated compliance checks.</p>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="relative z-10 py-24 sm:py-32">
          <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-soft">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About BidFlow</h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  We are on a mission to revolutionize how companies manage their RFP processes. Our platform combines
                  cutting-edge AI technology with intuitive design to make RFP management efficient and effective.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  {VALUES.map((value) => (
                    <div key={value.name} className="flex flex-col">
                      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        {value.icon}
                        {value.name}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p className="flex-auto">{value.description}</p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="btn-primary"
              >
                Get started for free
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative z-10 isolate mt-32 px-6 py-32 sm:mt-40 sm:py-40 lg:px-8">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-noise mix-blend-soft-light opacity-[0.15]"></div>
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to transform your RFP process?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Join thousands of companies that trust BidFlow to streamline their RFP management and win more business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="btn-primary"
              >
                Get started for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
