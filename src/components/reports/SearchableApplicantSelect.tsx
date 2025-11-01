import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

interface Applicant {
  id: string;
  fullName: string;
  email?: string;
  contactInfo?: string;
}

interface SearchableApplicantSelectProps {
  applicants: Applicant[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableApplicantSelect: React.FC<SearchableApplicantSelectProps> = ({
  applicants,
  value,
  onChange,
  onBlur,
  placeholder = 'Search applicants...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected applicant display name
  const selectedApplicant = applicants.find((a) => a.id === value);
  const displayValue = selectedApplicant ? selectedApplicant.fullName : 'All Applicants';

  // Filter applicants based on search query
  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) {
      return applicants.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    const query = searchQuery.toLowerCase();
    return applicants
      .filter((applicant) => {
        const nameMatch = applicant.fullName.toLowerCase().includes(query);
        const emailMatch = applicant.email?.toLowerCase().includes(query);
        const contactMatch = applicant.contactInfo?.toLowerCase().includes(query);
        return nameMatch || emailMatch || contactMatch;
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [applicants, searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (applicantId: string) => {
    onChange(applicantId);
    setIsOpen(false);
    setSearchQuery('');
    onBlur?.();
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white text-left flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-indigo-300 rounded-lg shadow-xl max-h-80 overflow-hidden animate-fadeIn">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm transition-all"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {/* All Applicants Option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full text-left px-4 py-3 transition-colors duration-150 flex items-center space-x-3 ${
                !value
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-500'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span>All Applicants</span>
            </button>

            {/* Filtered Applicants */}
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => (
                <button
                  key={applicant.id}
                  type="button"
                  onClick={() => handleSelect(applicant.id)}
                  className={`w-full text-left px-4 py-3 transition-colors duration-150 group ${
                    value === applicant.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-500'
                      : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <UserIcon className={`h-5 w-5 mt-0.5 ${
                      value === applicant.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        value === applicant.id ? 'text-indigo-700' : 'text-gray-900'
                      }`}>
                        {applicant.fullName}
                      </div>
                      {applicant.email && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {applicant.email}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">No applicants found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>

          {/* Footer with count */}
          {filteredApplicants.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Showing {filteredApplicants.length} of {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
