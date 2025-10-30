import React, { useState } from 'react';
import { addSampleResumes, sampleApplicants } from '../../utils/addSampleData';

export const AddSampleData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddData = async () => {
    try {
      setLoading(true);
      setError(null);
      const addedResumes = await addSampleResumes();
      setResults(addedResumes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sample data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Sample Resume Data
          </h1>
          <p className="text-gray-600 mb-8">
            Click the button below to add {sampleApplicants.length} sample resumes to the database for testing the Employer Portal landing page.
          </p>

          {/* Sample Data Preview */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Resumes to be Added:</h2>
            <div className="space-y-4">
              {sampleApplicants.map((applicant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <img
                      src={applicant.photoUrl || ''}
                      alt={applicant.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{applicant.fullName}</h3>
                      <p className="text-sm text-gray-600">{applicant.positionApplied} → {applicant.countryDestination}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Medical: Passed
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {applicant.gender === 'male' ? 'Male' : 'Female'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {applicant.workExperience.length} Years Experience
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Skills: {applicant.skills.slice(0, 3).join(', ')}
                          {applicant.skills.length > 3 && ` +${applicant.skills.length - 3} more`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleAddData}
              disabled={loading || results.length > 0}
              className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading || results.length > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding Sample Data...</span>
                </span>
              ) : results.length > 0 ? (
                '✓ Sample Data Added'
              ) : (
                `Add ${sampleApplicants.length} Sample Resumes`
              )}
            </button>

            {results.length === 0 && !error && (
              <p className="text-sm text-gray-500 text-center">
                This will add sample applicants with <span className="font-semibold">resumeVisible: true</span> and <span className="font-semibold">medical: passed</span>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-lg bg-red-50 border-2 border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error adding sample data</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {results.length > 0 && (
            <div className="mt-6 rounded-lg bg-green-50 border-2 border-green-200 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">Successfully added {results.length} sample resumes!</h3>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center text-sm text-green-700">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{result.name}</span>
                    <span className="mx-2">-</span>
                    <span>{result.position} ({result.destination})</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Employer Portal (Landing Page)
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Add More
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What this does:</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Adds 3 sample applicants to the Firestore <code className="bg-gray-100 px-1 py-0.5 rounded">applicants</code> collection</li>
              <li>All applicants have <code className="bg-gray-100 px-1 py-0.5 rounded">resumeVisible: true</code></li>
              <li>All applicants have <code className="bg-gray-100 px-1 py-0.5 rounded">medicalStatus.examination.result: "passed"</code></li>
              <li>All applicants have <code className="bg-gray-100 px-1 py-0.5 rounded">status: "active"</code></li>
              <li>Resumes will appear on the Employer Portal at <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:3000/</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
