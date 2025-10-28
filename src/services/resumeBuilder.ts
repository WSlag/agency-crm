import { Applicant } from '../types/applicant';
import { PublicResume, AgencyInfo, GeneratedResume } from '../types/resume';

/**
 * Converts an Applicant to a PublicResume by filtering sensitive information
 * SECURITY: This function removes all sensitive personal data to protect applicants
 */
export const convertToPublicResume = (applicant: Applicant): PublicResume => {
  // Calculate age (not birthdate for privacy)
  const today = new Date();
  const birthDate = new Date(applicant.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return {
    id: applicant.id,
    fullName: applicant.fullName,
    age, // Only age, NOT dateOfBirth for privacy
    nationality: applicant.nationality,
    gender: applicant.gender,
    civilStatus: applicant.civilStatus,
    // REMOVED: email - use inquiry form instead for privacy
    positionApplied: applicant.positionApplied,
    countryDestination: applicant.countryDestination,
    preferredCountries: applicant.preferredCountries,
    preferredPositions: applicant.preferredPositions,
    // REMOVED: expectedSalary - protects negotiating position
    education: applicant.education,
    workExperience: applicant.workExperience,
    skills: applicant.skills,
    certifications: applicant.certifications,
    languages: applicant.languages,
    photoUrl: applicant.photoUrl, // Only professional 2x2 photo
    // REMOVED: fullBodyPhotoUrl - not necessary, privacy concern
    // REMOVED: passportCopyUrl - CRITICAL: never expose passport documents
    // REMOVED: medicalExaminationDate - sensitive health information
    medicalResult: 'passed', // Only generic status, no dates
    createdAt: applicant.createdAt,
    resumeVisible: applicant.resumeVisible || false,
  };
};

/**
 * Generates a complete resume document with agency branding
 */
export const generateResume = (
  applicant: Applicant,
  agency: AgencyInfo
): GeneratedResume => {
  const publicResume = convertToPublicResume(applicant);

  return {
    applicant: publicResume,
    agency,
    generatedAt: new Date(),
    sections: {
      personalInfo: true,
      education: applicant.education.length > 0,
      experience: applicant.workExperience.length > 0,
      skills: applicant.skills.length > 0,
      languages: applicant.languages.length > 0,
      certifications: applicant.certifications.length > 0,
    },
  };
};

/**
 * Calculates total years of work experience
 */
export const calculateTotalExperience = (applicant: Applicant): number => {
  let totalMonths = 0;

  applicant.workExperience.forEach((exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += Math.max(0, months);
  });

  return Math.floor(totalMonths / 12);
};

/**
 * Calculates overseas work experience in years
 */
export const calculateOverseasExperience = (applicant: Applicant): number => {
  let totalMonths = 0;

  applicant.workExperience
    .filter((exp) => exp.isOverseas)
    .forEach((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();

      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                     (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    });

  return Math.floor(totalMonths / 12);
};

/**
 * Gets highest education level
 */
export const getHighestEducation = (applicant: Applicant): string => {
  if (applicant.education.length === 0) return 'Not specified';

  const educationLevels = [
    'Elementary',
    'High School',
    'Vocational',
    'College',
    'Bachelor',
    'Master',
    'Doctorate',
  ];

  let highest = applicant.education[0].level;
  let highestIndex = educationLevels.findIndex(
    (level) => level.toLowerCase() === highest.toLowerCase()
  );

  applicant.education.forEach((edu) => {
    const currentIndex = educationLevels.findIndex(
      (level) => level.toLowerCase() === edu.level.toLowerCase()
    );
    if (currentIndex > highestIndex) {
      highest = edu.level;
      highestIndex = currentIndex;
    }
  });

  return highest;
};

/**
 * Formats work experience for display
 */
export const formatWorkExperience = (
  workExperience: Applicant['workExperience'][0]
): string => {
  const startDate = new Date(workExperience.startDate);
  const endDate = workExperience.endDate
    ? new Date(workExperience.endDate)
    : null;

  const startStr = startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
  const endStr = endDate
    ? endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : 'Present';

  const duration = endDate
    ? calculateDuration(startDate, endDate)
    : calculateDuration(startDate, new Date());

  return `${startStr} - ${endStr} (${duration})`;
};

/**
 * Calculates duration between two dates
 */
const calculateDuration = (start: Date, end: Date): string => {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo${
      remainingMonths > 1 ? 's' : ''
    }`;
  } else if (years > 0) {
    return `${years} yr${years > 1 ? 's' : ''}`;
  } else {
    return `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
  }
};

/**
 * Checks if applicant matches search filters
 * SECURITY: Does not search by email to prevent email harvesting
 */
export const matchesSearchTerm = (
  applicant: Applicant,
  searchTerm: string
): boolean => {
  const term = searchTerm.toLowerCase();

  return (
    applicant.fullName.toLowerCase().includes(term) ||
    // REMOVED: email search - prevents email harvesting
    applicant.nationality.toLowerCase().includes(term) ||
    applicant.positionApplied?.toLowerCase().includes(term) ||
    applicant.countryDestination?.toLowerCase().includes(term) ||
    applicant.skills.some((skill) => skill.toLowerCase().includes(term)) ||
    applicant.preferredPositions.some((pos) =>
      pos.toLowerCase().includes(term)
    ) ||
    applicant.preferredCountries.some((country) =>
      country.toLowerCase().includes(term)
    )
  );
};

/**
 * Sorts applicants by various criteria
 */
export const sortApplicants = (
  applicants: Applicant[],
  sortBy: 'name' | 'age' | 'experience' | 'date'
): Applicant[] => {
  const sorted = [...applicants];

  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
      break;
    case 'age':
      sorted.sort((a, b) => {
        const ageA = new Date().getFullYear() - new Date(a.dateOfBirth).getFullYear();
        const ageB = new Date().getFullYear() - new Date(b.dateOfBirth).getFullYear();
        return ageA - ageB;
      });
      break;
    case 'experience':
      sorted.sort((a, b) => {
        const expA = calculateTotalExperience(a);
        const expB = calculateTotalExperience(b);
        return expB - expA;
      });
      break;
    case 'date':
      sorted.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      break;
  }

  return sorted;
};
