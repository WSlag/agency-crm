import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PublicResume, AgencyInfo } from '../../types/resume';
import { formatWorkExperience } from '../../services/resumeBuilder';
import { EmployerInquiryForm } from './EmployerInquiryForm';

interface ResumeDetailModalProps {
  resume: PublicResume;
  agencyInfo: AgencyInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeDetailModal: React.FC<ResumeDetailModalProps> = ({
  resume,
  agencyInfo,
  isOpen,
  onClose,
}) => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryType, setInquiryType] = useState<'shortlist' | 'contact'>('contact');

  const handleInquiryClick = (type: 'shortlist' | 'contact') => {
    setInquiryType(type);
    setShowInquiryForm(true);
  };

  const handleInquirySuccess = () => {
    setShowInquiryForm(false);
  };

  if (showInquiryForm) {
    return (
      <EmployerInquiryForm
        resume={resume}
        agencyInfo={agencyInfo}
        isOpen={isOpen}
        onClose={() => {
          setShowInquiryForm(false);
          onClose();
        }}
        inquiryType={inquiryType}
        onSuccess={handleInquirySuccess}
      />
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header with Agency Branding */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {agencyInfo?.logoUrl && (
                      <img
                        src={agencyInfo.logoUrl}
                        alt={agencyInfo.agencyName}
                        className="h-10 w-auto bg-white rounded px-2 py-1"
                      />
                    )}
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">
                        {agencyInfo?.agencyName || 'Resume'}
                      </h3>
                      <p className="text-xs text-blue-100">Professional Resume</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Resume Content */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-8">
                  {/* Personal Information Section */}
                  <div className="mb-8">
                    <div className="flex items-start space-x-6">
                      {/* Photos */}
                      <div className="flex-shrink-0 space-y-4">
                        {/* 2x2 Photo */}
                        {resume.photoUrl ? (
                          <img
                            src={resume.photoUrl}
                            alt={resume.fullName}
                            className="w-32 h-32 rounded-lg border-4 border-gray-200 object-cover shadow-lg"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-lg border-4 border-gray-200 bg-gray-300 flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Basic Info */}
                      <div className="flex-grow">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {resume.fullName}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Age:</span>{' '}
                            <span className="font-medium">{resume.age} years</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Gender:</span>{' '}
                            <span className="font-medium capitalize">{resume.gender}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Nationality:</span>{' '}
                            <span className="font-medium">{resume.nationality}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Civil Status:</span>{' '}
                            <span className="font-medium capitalize">
                              {resume.civilStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Medical Status:</span>{' '}
                            <span className="font-medium text-green-600">✓ Passed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Preferences */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                      Job Preferences
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {resume.positionApplied && (
                        <div>
                          <label className="text-sm text-gray-600">Position Applied:</label>
                          <p className="font-medium text-gray-900">
                            {resume.positionApplied}
                          </p>
                        </div>
                      )}
                      {resume.countryDestination && (
                        <div>
                          <label className="text-sm text-gray-600">
                            Preferred Country:
                          </label>
                          <p className="font-medium text-gray-900">
                            {resume.countryDestination}
                          </p>
                        </div>
                      )}
                      {resume.preferredPositions.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Other Positions:</label>
                          <p className="font-medium text-gray-900">
                            {resume.preferredPositions.join(', ')}
                          </p>
                        </div>
                      )}
                      {resume.preferredCountries.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600">Other Countries:</label>
                          <p className="font-medium text-gray-900">
                            {resume.preferredCountries.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  {resume.education.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                        Education
                      </h3>
                      <div className="space-y-3">
                        {resume.education.map((edu, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900">{edu.level}</h4>
                            <p className="text-gray-700">{edu.course}</p>
                            <p className="text-sm text-gray-600">
                              {edu.school} • {edu.yearCompleted}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Experience */}
                  {resume.workExperience.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                        Work Experience
                      </h3>
                      <div className="space-y-4">
                        {resume.workExperience.map((exp, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                              {exp.isOverseas && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  Overseas
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 font-medium">{exp.company}</p>
                            <p className="text-sm text-gray-600">
                              {exp.location} • {formatWorkExperience(exp)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {resume.skills.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {resume.languages.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                        Languages
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {resume.languages.map((lang, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{lang.language}</span>
                            <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                              {lang.proficiency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {resume.certifications.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
                        Certifications
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {resume.certifications.map((cert, index) => (
                          <li key={index} className="text-gray-700">
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                {/* Footer with Actions */}
                <div className="bg-gray-50 px-8 py-4 flex justify-between items-center border-t">
                  <div className="text-sm text-gray-600">
                    <p>Interested in this candidate?</p>
                    <p className="text-xs">Contact {agencyInfo?.agencyName} for more details</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleInquiryClick('shortlist')}
                      className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Express Interest
                    </button>
                    <button
                      onClick={() => handleInquiryClick('contact')}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
                    >
                      Contact Agency
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
