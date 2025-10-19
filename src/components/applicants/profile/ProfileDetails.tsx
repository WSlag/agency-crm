import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { Applicant } from '../../../types/applicant';
import { CommunicationHistory } from '../CommunicationHistory';
import { DocumentsTab } from './DocumentsTab';

interface ProfileDetailsProps {
  applicant: Applicant;
}

export const ProfileDetails = ({ applicant }: ProfileDetailsProps) => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const tabs = [
    { name: 'Personal Info', key: 'personal', content: <PersonalInfo applicant={applicant} /> },
    { name: 'Job Preferences', key: 'job', content: <JobPreferences applicant={applicant} /> },
    { name: 'Education & Experience', key: 'education', content: <EducationExperience applicant={applicant} /> },
    { name: 'Medical Info', key: 'medical', content: <MedicalInfo applicant={applicant} /> },
    { name: 'Emergency Contact', key: 'emergency', content: <EmergencyContact applicant={applicant} /> },
    { name: 'Documents', key: 'documents', content: <DocumentsTab applicant={applicant} /> },
    { name: 'Communications', key: 'communications', content: <CommunicationHistory applicantId={applicant.id} /> },
  ];
  
  // Find the initial tab index based on URL parameter
  const getInitialTabIndex = () => {
    if (tabParam) {
      const index = tabs.findIndex(tab => tab.key === tabParam);
      return index !== -1 ? index : 0;
    }
    return 0;
  };
  
  const [selectedIndex, setSelectedIndex] = useState(getInitialTabIndex());
  
  // Update selected tab when URL parameter changes
  useEffect(() => {
    const newIndex = getInitialTabIndex();
    setSelectedIndex(newIndex);
  }, [tabParam]);

  return (
    <div className="mt-8">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="border-b border-gray-200">
          <div className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                    selected
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </div>
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className="bg-white shadow sm:rounded-lg p-4 sm:p-6"
            >
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

const PersonalInfo = ({ applicant }: ProfileDetailsProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
      <div>
        <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
        <dd className="mt-1 text-sm text-gray-900">
          {applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : 'N/A'}
        </dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Place of Birth</dt>
        <dd className="mt-1 text-sm text-gray-900">{applicant.placeOfBirth || 'N/A'}</dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Nationality</dt>
        <dd className="mt-1 text-sm text-gray-900">{applicant.nationality || 'N/A'}</dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Civil Status</dt>
        <dd className="mt-1 text-sm text-gray-900 capitalize">{applicant.civilStatus || 'N/A'}</dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Gender</dt>
        <dd className="mt-1 text-sm text-gray-900 capitalize">{applicant.gender || 'N/A'}</dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Position Applied</dt>
        <dd className="mt-1 text-sm text-gray-900">{applicant.positionApplied || 'N/A'}</dd>
      </div>
      
      <div>
        <dt className="text-sm font-medium text-gray-500">Country Destination</dt>
        <dd className="mt-1 text-sm text-gray-900">{applicant.countryDestination || 'N/A'}</dd>
      </div>
    </div>

    <div>
      <dt className="text-sm font-medium text-gray-500">Present Address</dt>
      <dd className="mt-1 text-sm text-gray-900">{applicant.address?.present || 'N/A'}</dd>
    </div>

    <div>
      <dt className="text-sm font-medium text-gray-500">Permanent Address</dt>
      <dd className="mt-1 text-sm text-gray-900">{applicant.address?.permanent || 'N/A'}</dd>
    </div>
  </div>
);

const JobPreferences = ({ applicant }: ProfileDetailsProps) => (
  <div className="space-y-6">
    <div>
      <dt className="text-sm font-medium text-gray-500">Preferred Countries</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {applicant.preferredCountries && applicant.preferredCountries.length > 0 ? (
          <ul className="list-disc list-inside">
            {applicant.preferredCountries.map((country, index) => (
              <li key={index}>{country}</li>
            ))}
          </ul>
        ) : (
          'N/A'
        )}
      </dd>
    </div>

    <div>
      <dt className="text-sm font-medium text-gray-500">Preferred Positions</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {applicant.preferredPositions && applicant.preferredPositions.length > 0 ? (
          <ul className="list-disc list-inside">
            {applicant.preferredPositions.map((position, index) => (
              <li key={index}>{position}</li>
            ))}
          </ul>
        ) : (
          'N/A'
        )}
      </dd>
    </div>

    <div>
      <dt className="text-sm font-medium text-gray-500">Expected Salary</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {applicant.expectedSalary ? `${applicant.expectedSalary.amount} ${applicant.expectedSalary.currency}` : 'N/A'}
      </dd>
    </div>
  </div>
);

const EducationExperience = ({ applicant }: ProfileDetailsProps) => (
  <div className="space-y-8">
    <div>
      <h4 className="text-sm font-medium text-gray-900">Education</h4>
      <div className="mt-4 space-y-4">
        {applicant.education && applicant.education.length > 0 ? (
          applicant.education.map((edu, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Level</dt>
                  <dd className="text-sm text-gray-900">{edu.level || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Course</dt>
                  <dd className="text-sm text-gray-900">{edu.course || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">School</dt>
                  <dd className="text-sm text-gray-900">{edu.school || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Year Completed</dt>
                  <dd className="text-sm text-gray-900">{edu.yearCompleted || 'N/A'}</dd>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No education information available</p>
        )}
      </div>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900">Work Experience</h4>
      <div className="mt-4 space-y-4">
        {applicant.workExperience && applicant.workExperience.length > 0 ? (
          applicant.workExperience.map((work, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="text-sm text-gray-900">{work.company || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Position</dt>
                  <dd className="text-sm text-gray-900">{work.position || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">{work.location || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="text-sm text-gray-900">
                    {work.startDate ? new Date(work.startDate).toLocaleDateString() : 'N/A'} - 
                    {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Present'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900">
                    {work.isOverseas ? 'Overseas' : 'Local'}
                  </dd>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No work experience available</p>
        )}
      </div>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900">Skills</h4>
      <dd className="mt-2 text-sm text-gray-900">
        {applicant.skills && applicant.skills.length > 0 ? applicant.skills.join(', ') : 'N/A'}
      </dd>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900">Certifications</h4>
      <dd className="mt-2 text-sm text-gray-900">
        {applicant.certifications && applicant.certifications.length > 0 ? applicant.certifications.join(', ') : 'N/A'}
      </dd>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900">Languages</h4>
      <div className="mt-2 space-y-2">
        {applicant.languages && applicant.languages.length > 0 ? (
          applicant.languages.map((lang, index) => (
            <div key={index} className="text-sm text-gray-900">
              {lang.language} - {lang.proficiency}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No language information available</p>
        )}
      </div>
    </div>
  </div>
);

const MedicalInfo = ({ applicant }: ProfileDetailsProps) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-sm font-medium text-gray-900">Medical Examination</h4>
      <div className="mt-4 grid grid-cols-1 gap-y-2 sm:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-gray-500">Date</dt>
          <dd className="text-sm text-gray-900">
            {applicant.medicalStatus?.examination?.date
              ? new Date(applicant.medicalStatus.examination.date).toLocaleDateString()
              : 'Not yet examined'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Result</dt>
          <dd className="text-sm text-gray-900 capitalize">
            {applicant.medicalStatus?.examination?.result || 'Pending'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Facility</dt>
          <dd className="text-sm text-gray-900">
            {applicant.medicalStatus?.examination?.facility || 'N/A'}
          </dd>
        </div>
      </div>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900">Medical Conditions</h4>
      <dd className="mt-2 text-sm text-gray-900">
        {applicant.medicalStatus?.conditions && applicant.medicalStatus.conditions.length > 0
          ? applicant.medicalStatus.conditions.join(', ')
          : 'None declared'}
      </dd>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900">Allergies</h4>
      <dd className="mt-2 text-sm text-gray-900">
        {applicant.medicalStatus?.allergies && applicant.medicalStatus.allergies.length > 0
          ? applicant.medicalStatus.allergies.join(', ')
          : 'None declared'}
      </dd>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900">Vaccinations</h4>
      <div className="mt-2 space-y-2">
        {applicant.medicalStatus?.vaccinations && applicant.medicalStatus.vaccinations.length > 0 ? (
          applicant.medicalStatus.vaccinations.map((vax, index) => (
            <div key={index} className="text-sm text-gray-900">
              {vax.name} - {vax.date ? new Date(vax.date).toLocaleDateString() : 'N/A'}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No vaccination records</p>
        )}
      </div>
    </div>
  </div>
);

const EmergencyContact = ({ applicant }: ProfileDetailsProps) => (
  <div className="space-y-4">
    <div>
      <dt className="text-sm font-medium text-gray-500">Name</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {applicant.emergencyContact?.name || 'N/A'}
      </dd>
    </div>

    <div>
      <dt className="text-sm font-medium text-gray-500">Relationship</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {applicant.emergencyContact?.relationship || 'N/A'}
      </dd>
    </div>

    <div>
      <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {applicant.emergencyContact?.contactNumber || 'N/A'}
      </dd>
    </div>

    <div>
      <dt className="text-sm font-medium text-gray-500">Address</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {applicant.emergencyContact?.address || 'N/A'}
      </dd>
    </div>
  </div>
);
