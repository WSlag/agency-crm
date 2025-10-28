import React, { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { ResumeCard } from '../../components/public/ResumeCard';
import { ResumeDetailModal } from '../../components/public/ResumeDetailModal';
import { useResumeStore } from '../../stores/resumeStore';
import { PublicResume } from '../../types/resume';

export const EmployerPortal: React.FC = () => {
  const {
    publicResumes,
    agencyInfo,
    loading,
    sortBy,
    fetchPublicResumes,
    setFilters,
    setSortBy,
    getFilteredResumes,
  } = useResumeStore();

  const [selectedResume, setSelectedResume] = useState<PublicResume | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPublicResumes();
  }, [fetchPublicResumes]);

  // Get unique countries and positions for filters
  const uniqueCountries = React.useMemo(() => {
    const countries = new Set<string>();
    publicResumes.forEach((resume) => {
      if (resume.countryDestination) countries.add(resume.countryDestination);
      resume.preferredCountries.forEach((country) => countries.add(country));
    });
    return Array.from(countries).sort();
  }, [publicResumes]);

  const uniquePositions = React.useMemo(() => {
    const positions = new Set<string>();
    publicResumes.forEach((resume) => {
      if (resume.positionApplied) positions.add(resume.positionApplied);
      resume.preferredPositions.forEach((pos) => positions.add(pos));
    });
    return Array.from(positions).sort();
  }, [publicResumes]);

  // Apply filters
  useEffect(() => {
    setFilters({
      search: searchTerm || undefined,
      countries: selectedCountries.length > 0 ? selectedCountries : undefined,
      positions: selectedPositions.length > 0 ? selectedPositions : undefined,
      gender: selectedGender ? (selectedGender as any) : undefined,
    });
  }, [searchTerm, selectedCountries, selectedPositions, selectedGender, setFilters]);

  const filteredResumes = getFilteredResumes();
  const featuredResumes = publicResumes.slice(0, 8);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCountries([]);
    setSelectedPositions([]);
    setSelectedGender('');
  };

  const scrollToWorkers = () => {
    setShowAllWorkers(true);
    const element = document.getElementById('all-workers');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PublicLayout>
      {/* HERO SECTION - Full Width with Background Image like Goodwin Recruiting */}
      <div className="relative w-full h-[600px] lg:h-[700px] overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&h=1200&fit=crop"
            alt="Scenic coastal road"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00263E]/85 via-[#00263E]/70 to-[#00263E]/50"></div>
        </div>

        {/* Top Navigation Bar Inside Hero */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 lg:px-12 py-6">
          <div className="max-w-[1500px] mx-auto flex items-center justify-between">
            {/* Agency Logo/Name - Left */}
            <div className="flex items-center space-x-3">
              {agencyInfo?.logoUrl ? (
                <img
                  src={agencyInfo.logoUrl}
                  alt={agencyInfo.agencyName}
                  className="h-12 w-auto"
                />
              ) : (
                <div className="w-12 h-12 bg-[#F18A00] rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xl" style={{fontFamily: 'Lato, sans-serif'}}>
                    {agencyInfo?.agencyName?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-white" style={{fontFamily: 'Lato, sans-serif'}}>
                  {agencyInfo?.agencyName || 'AL Hamra Agency'}
                </h2>
                <p className="text-xs text-white/80 font-light uppercase tracking-wider" style={{fontFamily: 'Lato, sans-serif'}}>
                  {agencyInfo?.tagline || 'Your Trusted Partner'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation - Right */}
            <nav className="hidden lg:flex items-center space-x-6">
              <a
                href="#all-workers"
                className="text-sm font-bold text-white hover:text-[#F18A00] transition-colors uppercase tracking-wide"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                Find Talent
              </a>
              <a
                href="#about"
                className="text-sm font-bold text-white hover:text-[#F18A00] transition-colors uppercase tracking-wide"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                Search Jobs
              </a>
              <a
                href={`mailto:${agencyInfo?.email || 'info@agency.com'}`}
                className="text-sm font-bold text-white hover:text-[#F18A00] transition-colors uppercase tracking-wide"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                Join {agencyInfo?.agencyName || 'Agency'}
              </a>
              {/* Contact Info */}
              {agencyInfo && (
                <div className="hidden xl:flex items-center space-x-4 text-xs text-white/90 ml-6 pl-6 border-l border-white/30">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-light">{agencyInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-light">{agencyInfo.email}</span>
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#F18A00] transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 animate-fade-in">
              <nav className="flex flex-col space-y-4">
                <a
                  href="#all-workers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-[#00263E] hover:text-[#F18A00] transition-colors uppercase tracking-wide"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  Find Talent
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-[#00263E] hover:text-[#F18A00] transition-colors uppercase tracking-wide"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  Search Jobs
                </a>
                <a
                  href={`mailto:${agencyInfo?.email || 'info@agency.com'}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-[#00263E] hover:text-[#F18A00] transition-colors uppercase tracking-wide"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  Join {agencyInfo?.agencyName || 'Agency'}
                </a>
                {agencyInfo && (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <p className="text-sm text-[#63656A] mb-2" style={{fontFamily: 'Lato, sans-serif'}}>Contact Us:</p>
                      <p className="text-sm text-[#00263E] font-light mb-1">{agencyInfo.phone}</p>
                      <p className="text-sm text-[#00263E] font-light">{agencyInfo.email}</p>
                    </div>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>

        <div className="relative h-full max-w-[1500px] mx-auto px-6 lg:px-12 flex items-center">
          <div className="max-w-4xl">
            {/* Main Hero Content */}
            <div className="text-center lg:text-left text-white">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-tight" style={{fontFamily: 'Lato, sans-serif'}}>
                Matching Talent
                <br />
                <span className="text-white">
                  With Opportunity
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-white mb-10 leading-relaxed font-light max-w-3xl" style={{fontFamily: 'Lato, sans-serif'}}>
                A Forbes Best Recruitment Company & Trusted Partner In Your Success
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <button
                  onClick={scrollToWorkers}
                  className="px-10 py-4 bg-white text-[#00263E] rounded-lg font-bold text-base uppercase tracking-wide hover:bg-gray-100 transition-all duration-300 shadow-xl"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  FIND TALENT
                </button>
                <a
                  href={`mailto:${agencyInfo?.email || 'info@agency.com'}`}
                  className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-lg font-bold text-base uppercase tracking-wide hover:bg-white hover:text-[#00263E] transition-all duration-300"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  JOIN {agencyInfo?.agencyName?.toUpperCase() || 'AGENCY'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE US INFO BOXES - With Images */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Employers Box */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-white to-[#EAF7FF] p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"
                  alt="For Employers"
                  className="w-48 h-48 object-cover rounded-lg shadow-md"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#00263E] mb-3" style={{fontFamily: 'Lato, sans-serif'}}>
                  For Employers
                </h3>
                <p className="text-[#63656A] mb-4 font-light leading-relaxed" style={{fontFamily: 'Lato, sans-serif'}}>
                  Find pre-vetted, medical-certified Filipino professionals ready to join your team. We handle all documentation, compliance, and deployment logistics.
                </p>
                <button
                  onClick={scrollToWorkers}
                  className="px-6 py-3 bg-[#F18A00] text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-[#d67a00] transition-all duration-300"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  Browse Workers
                </button>
              </div>
            </div>
          </div>

          {/* For Workers Box */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-white to-[#EAF7FF] p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
                  alt="For Workers"
                  className="w-48 h-48 object-cover rounded-lg shadow-md"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#00263E] mb-3" style={{fontFamily: 'Lato, sans-serif'}}>
                  For Workers
                </h3>
                <p className="text-[#63656A] mb-4 font-light leading-relaxed" style={{fontFamily: 'Lato, sans-serif'}}>
                  Advance your career with international opportunities. We provide full support, from documentation to deployment and beyond.
                </p>
                <a
                  href={`mailto:${agencyInfo?.email || 'info@agency.com'}`}
                  className="inline-block px-6 py-3 bg-[#00263E] text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-[#003d5c] transition-all duration-300"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Wave Separator */}
      <div className="relative w-full h-16 mb-12">
        <svg viewBox="0 0 1200 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,50 Q300,10 600,50 T1200,50 L1200,100 L0,100 Z" fill="#F7F7F7" opacity="0.3"/>
        </svg>
      </div>

      {/* STATS SECTION */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-16">
        <div className="bg-gradient-to-br from-[#F7F7F7] to-white rounded-2xl py-12 px-8 shadow-lg border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                number: publicResumes.length + '+',
                label: 'Available Workers',
                icon: (
                  <svg className="w-8 h-8 mx-auto mb-3 text-[#F18A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                number: uniquePositions.length + '+',
                label: 'Job Positions',
                icon: (
                  <svg className="w-8 h-8 mx-auto mb-3 text-[#F18A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                number: uniqueCountries.length + '+',
                label: 'Countries Served',
                icon: (
                  <svg className="w-8 h-8 mx-auto mb-3 text-[#F18A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                number: '100%',
                label: 'Verified & Certified',
                icon: (
                  <svg className="w-8 h-8 mx-auto mb-3 text-[#F18A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                )
              }
            ].map((stat, i) => (
              <div key={i} className="text-center border-r border-gray-300 last:border-r-0 px-4">
                {stat.icon}
                <div className="text-4xl font-black text-[#00263E] mb-2" style={{fontFamily: 'Lato, sans-serif'}}>{stat.number}</div>
                <div className="text-sm text-[#63656A] uppercase tracking-wide font-bold" style={{fontFamily: 'Lato, sans-serif'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-[#00263E] mb-4" style={{fontFamily: 'Lato, sans-serif'}}>
            How It Works
          </h2>
          <p className="text-base text-[#63656A] max-w-2xl mx-auto font-light" style={{fontFamily: 'Lato, sans-serif'}}>
            Get started in 3 simple steps and hire your perfect candidate in days, not months.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Browse & Search',
              description: 'Explore our pool of pre-vetted professionals. Use advanced filters to find candidates matching your exact requirements.',
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )
            },
            {
              step: '2',
              title: 'Express Interest',
              description: 'Found someone perfect? Click to express interest or contact us directly about the candidate. We respond within 24 hours.',
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              step: '3',
              title: 'We Handle Everything',
              description: 'We manage all documentation, deployment, and onboarding. You focus on growing your business while we handle the details.',
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F18A00] opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-[#F18A00] to-[#d67a00] text-white rounded-xl flex items-center justify-center mb-6 shadow-lg relative z-10">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-[#00263E] mb-3 relative z-10" style={{fontFamily: 'Lato, sans-serif'}}>{item.title}</h3>
              <p className="text-[#63656A] leading-relaxed font-light relative z-10" style={{fontFamily: 'Lato, sans-serif'}}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED WORKERS SECTION */}
      {featuredResumes.length > 0 && (
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-[#00263E] mb-4" style={{fontFamily: 'Lato, sans-serif'}}>
              Featured Workers
            </h2>
            <p className="text-base text-[#63656A] font-light" style={{fontFamily: 'Lato, sans-serif'}}>
              Meet some of our top-rated, verified professionals ready for deployment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredResumes.map((resume, index) => (
              <div key={resume.id}>
                <ResumeCard resume={resume} onClick={() => setSelectedResume(resume)} />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={scrollToWorkers}
              className="px-8 py-4 bg-[#F18A00] text-white rounded-lg font-bold text-base uppercase tracking-wide hover:bg-[#d67a00] transition-all duration-300"
              style={{fontFamily: 'Lato, sans-serif'}}
            >
              View All {publicResumes.length} Workers
            </button>
          </div>
        </div>
      )}

      {/* BENEFITS SECTION */}
      <div className="bg-[#F7F7F7] py-16 mb-20">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-[#00263E] mb-4" style={{fontFamily: 'Lato, sans-serif'}}>
              Why Choose {agencyInfo?.agencyName || 'Our Agency'}?
            </h2>
            <p className="text-base text-[#63656A] max-w-2xl mx-auto font-light" style={{fontFamily: 'Lato, sans-serif'}}>
              We handle all the complex parts of international hiring, so you don't have to.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Medical Certified',
                description: 'All workers pass rigorous medical examinations',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: 'Fully Documented',
                description: 'Complete paperwork and legal compliance',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                title: 'Fast Deployment',
                description: 'Quick turnaround from selection to arrival',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: 'Risk-Free Hiring',
                description: 'Replacement guarantee if not satisfied',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: 'Skilled Professionals',
                description: 'Verified experience and qualifications',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                )
              },
              {
                title: 'Global Reach',
                description: 'Deploy workers to any country worldwide',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: 'English Fluent',
                description: 'Excellent communication skills guaranteed',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )
              },
              {
                title: 'Full Support',
                description: '24/7 assistance throughout the process',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#F18A00] to-[#d67a00] text-white rounded-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="font-black text-base text-[#00263E] mb-2" style={{fontFamily: 'Lato, sans-serif'}}>{benefit.title}</h3>
                <p className="text-[#63656A] text-sm font-light" style={{fontFamily: 'Lato, sans-serif'}}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Wave Separator */}
      <div className="relative w-full h-16 mb-12">
        <svg viewBox="0 0 1200 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,50 Q300,90 600,50 T1200,50 L1200,0 L0,0 Z" fill="#00263E" opacity="0.05"/>
        </svg>
      </div>

      {/* TESTIMONIALS SECTION */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-[#00263E] mb-4" style={{fontFamily: 'Lato, sans-serif'}}>
            What Our Clients Say
          </h2>
          <p className="text-base text-[#63656A] max-w-2xl mx-auto font-light" style={{fontFamily: 'Lato, sans-serif'}}>
            Trusted by companies worldwide for quality talent and exceptional service
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "The workers we hired through this agency have been exceptional. The entire process was smooth and professional.",
              name: "Sarah Johnson",
              company: "Global Manufacturing Co.",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
            },
            {
              quote: "Outstanding service from start to finish. They handled all the paperwork and compliance, making international hiring effortless.",
              name: "Michael Chen",
              company: "Tech Solutions Inc.",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
            },
            {
              quote: "We've been working with them for 3 years now. The quality of candidates and support has been consistently excellent.",
              name: "Emma Rodriguez",
              company: "Healthcare Group",
              image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-[#F18A00]"
                />
                <p className="text-[#00263E] text-lg mb-6 font-light italic leading-relaxed" style={{fontFamily: 'Lato, sans-serif'}}>
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-black text-[#00263E] text-base" style={{fontFamily: 'Lato, sans-serif'}}>{testimonial.name}</p>
                  <p className="text-[#63656A] text-sm font-light" style={{fontFamily: 'Lato, sans-serif'}}>{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEET OUR TEAM SECTION */}
      <div className="bg-gradient-to-b from-white to-[#EAF7FF] py-16 mb-20">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-[#00263E] mb-4" style={{fontFamily: 'Lato, sans-serif'}}>
              Meet Our Team
            </h2>
            <p className="text-base text-[#63656A] max-w-2xl mx-auto font-light" style={{fontFamily: 'Lato, sans-serif'}}>
              Experienced professionals dedicated to connecting talent with opportunity
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: "Maria Santos", role: "Recruitment Manager", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop" },
              { name: "John Rivera", role: "Client Relations", image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=300&fit=crop" },
              { name: "Ana Cruz", role: "Documentation Specialist", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" },
              { name: "Carlos Mendez", role: "Compliance Officer", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" },
              { name: "Lisa Garcia", role: "HR Coordinator", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop" },
              { name: "David Lopez", role: "Operations Manager", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop" }
            ].map((member, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="font-black text-[#00263E] text-base mb-1" style={{fontFamily: 'Lato, sans-serif'}}>{member.name}</p>
                  <p className="text-[#63656A] text-sm font-light" style={{fontFamily: 'Lato, sans-serif'}}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUCCESS STORIES SECTION */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-[#00263E] mb-4" style={{fontFamily: 'Lato, sans-serif'}}>
            Success Stories
          </h2>
          <p className="text-base text-[#63656A] max-w-2xl mx-auto font-light" style={{fontFamily: 'Lato, sans-serif'}}>
            Real results from companies that trust us with their workforce needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Healthcare Staffing Success",
              description: "Placed 50+ nurses in UAE hospitals with 98% retention rate over 2 years.",
              stat: "98% Retention",
              image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop"
            },
            {
              title: "Manufacturing Excellence",
              description: "Deployed skilled technicians to 3 countries, reducing hiring time by 60%.",
              stat: "60% Faster",
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
            },
            {
              title: "Hospitality Expansion",
              description: "Supported hotel chain expansion with 100+ trained service professionals.",
              stat: "100+ Placements",
              image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"
            }
          ].map((story, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#F18A00] text-white px-4 py-2 rounded-lg font-black text-sm" style={{fontFamily: 'Lato, sans-serif'}}>
                  {story.stat}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-[#00263E] mb-3" style={{fontFamily: 'Lato, sans-serif'}}>
                  {story.title}
                </h3>
                <p className="text-[#63656A] font-light leading-relaxed" style={{fontFamily: 'Lato, sans-serif'}}>
                  {story.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SECTION BEFORE SEARCH */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-20">
        <div className="relative overflow-hidden bg-[#00263E] rounded-lg p-12 text-center text-white">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=600&fit=crop"
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-black mb-4" style={{fontFamily: 'Lato, sans-serif'}}>
              Ready to Build Your Dream Team?
            </h2>
            <p className="text-base text-gray-300 mb-8 max-w-2xl mx-auto font-light" style={{fontFamily: 'Lato, sans-serif'}}>
              Start browsing our talented pool of professionals below or contact us for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${agencyInfo?.email || 'info@agency.com'}`}
                className="px-8 py-4 bg-[#F18A00] text-white rounded-lg font-bold text-base uppercase tracking-wide hover:bg-[#d67a00] transition-all duration-300"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                Contact Us Today
              </a>
              <a
                href={`tel:${agencyInfo?.phone || ''}`}
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-bold text-base uppercase tracking-wide hover:bg-white hover:text-[#00263E] transition-all duration-300"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                {agencyInfo?.phone || 'Call Us'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ALL WORKERS SECTION */}
      <div id="all-workers" className="scroll-mt-20 max-w-[1500px] mx-auto px-6 lg:px-12">
        {/* Enhanced Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-10 border border-gray-200">
          <h2 className="text-2xl font-black text-[#00263E] mb-2" style={{fontFamily: 'Lato, sans-serif'}}>
            Search Available Workers
          </h2>
          <p className="text-[#63656A] mb-6 font-light" style={{fontFamily: 'Lato, sans-serif'}}>Use filters below to find your perfect candidate</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-[#00263E] mb-2 uppercase" style={{fontFamily: 'Lato, sans-serif'}}>
                Search by Name or Skills
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Nurse, Carpenter, Engineer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F18A00] transition-all text-[#00263E] placeholder-gray-400"
                  style={{fontFamily: 'Lato, sans-serif'}}
                />
              </div>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-bold text-[#00263E] mb-2 uppercase" style={{fontFamily: 'Lato, sans-serif'}}>
                Destination Country
              </label>
              <select
                value={selectedCountries[0] || ''}
                onChange={(e) =>
                  setSelectedCountries(e.target.value ? [e.target.value] : [])
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F18A00] transition-all text-[#00263E] bg-white"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                <option value="">All Countries</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-sm font-bold text-[#00263E] mb-2 uppercase" style={{fontFamily: 'Lato, sans-serif'}}>
                Job Position
              </label>
              <select
                value={selectedPositions[0] || ''}
                onChange={(e) =>
                  setSelectedPositions(e.target.value ? [e.target.value] : [])
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F18A00] transition-all text-[#00263E] bg-white"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                <option value="">All Positions</option>
                {uniquePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-[#00263E] uppercase" style={{fontFamily: 'Lato, sans-serif'}}>Gender:</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F18A00] text-sm bg-white text-[#00263E]"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-[#00263E] uppercase" style={{fontFamily: 'Lato, sans-serif'}}>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F18A00] text-sm bg-white text-[#00263E]"
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  <option value="date">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="age">Age</option>
                  <option value="experience">Experience</option>
                </select>
              </div>
            </div>

            {(searchTerm ||
              selectedCountries.length > 0 ||
              selectedPositions.length > 0 ||
              selectedGender) && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 text-sm font-bold text-[#F18A00] hover:text-[#d67a00] hover:bg-orange-50 rounded-lg transition-all uppercase tracking-wide"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-8">
          <p className="text-[#63656A] text-base font-light" style={{fontFamily: 'Lato, sans-serif'}}>
            <span className="font-black text-[#00263E]">{filteredResumes.length}</span> workers found
            {(searchTerm || selectedCountries.length > 0 || selectedPositions.length > 0 || selectedGender) &&
              <span className="text-[#63656A]"> (filtered from {publicResumes.length} total)</span>
            }
          </p>
        </div>

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-200">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && filteredResumes.length === 0 && (
          <div className="text-center py-20 bg-[#F7F7F7] rounded-lg border border-gray-200">
            <div className="mx-auto w-20 h-20 bg-[#F18A00] rounded-lg flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-[#00263E] mb-3" style={{fontFamily: 'Lato, sans-serif'}}>No Workers Found</h3>
            <p className="text-[#63656A] mb-6 max-w-md mx-auto font-light" style={{fontFamily: 'Lato, sans-serif'}}>
              {publicResumes.length === 0
                ? 'No workers are currently available. Please check back later or contact us directly.'
                : 'Try adjusting your search or filter criteria to find more workers.'}
            </p>
            {publicResumes.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="px-8 py-3 bg-[#F18A00] text-white rounded-lg hover:bg-[#d67a00] font-bold uppercase tracking-wide transition-all duration-300"
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Enhanced Resume Grid */}
        {!loading && filteredResumes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredResumes.map((resume) => (
              <div key={resume.id}>
                <ResumeCard resume={resume} onClick={() => setSelectedResume(resume)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Detail Modal */}
      {selectedResume && (
        <ResumeDetailModal
          resume={selectedResume}
          agencyInfo={agencyInfo}
          isOpen={!!selectedResume}
          onClose={() => setSelectedResume(null)}
        />
      )}
    </PublicLayout>
  );
};
