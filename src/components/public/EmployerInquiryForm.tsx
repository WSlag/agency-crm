import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PublicResume, AgencyInfo } from '../../types/resume';
import { useResumeStore } from '../../stores/resumeStore';

interface EmployerInquiryFormProps {
  resume: PublicResume;
  agencyInfo: AgencyInfo | null;
  isOpen: boolean;
  onClose: () => void;
  inquiryType: 'shortlist' | 'contact';
  onSuccess: () => void;
}

export const EmployerInquiryForm: React.FC<EmployerInquiryFormProps> = ({
  resume,
  agencyInfo,
  isOpen,
  onClose,
  inquiryType,
  onSuccess,
}) => {
  const { submitInquiry } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employerName: '',
    companyName: '',
    email: '',
    phone: '',
    country: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitInquiry({
        applicantId: resume.id,
        applicantName: resume.fullName,
        inquiryType,
        employerName: formData.employerName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        message: formData.message || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
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
                        {inquiryType === 'shortlist'
                          ? 'Express Interest'
                          : 'Contact Agency'}
                      </h3>
                      <p className="text-xs text-blue-100">
                        Regarding: {resume.fullName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg
                          className="h-8 w-8 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Thank You!
                      </h3>
                      <p className="text-gray-600">
                        Your inquiry has been submitted successfully.
                      </p>
                      <p className="text-gray-600 mt-2">
                        {agencyInfo?.agencyName} will contact you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Applicant Info */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-1">
                          You are inquiring about:
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {resume.fullName}
                        </p>
                        {resume.positionApplied && (
                          <p className="text-sm text-gray-600">
                            Position: {resume.positionApplied}
                          </p>
                        )}
                      </div>

                      {/* Employer Information */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="employerName"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Your Name *
                            </label>
                            <input
                              type="text"
                              id="employerName"
                              name="employerName"
                              value={formData.employerName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="John Smith"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="companyName"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Company Name *
                            </label>
                            <input
                              type="text"
                              id="companyName"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="ABC Company"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Email Address *
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="john@company.com"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="phone"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="+971-xxx-xxxx"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Your Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="United Arab Emirates"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="message"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Message {inquiryType === 'contact' && '*'}
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required={inquiryType === 'contact'}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder={
                              inquiryType === 'shortlist'
                                ? 'Add any additional notes (optional)'
                                : 'Tell us about your requirements and timeline'
                            }
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            'Submit Inquiry'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
