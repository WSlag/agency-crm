// Utility function to add sample resume data
// This can be called from the browser console for testing

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export const sampleApplicants = [
  {
    // Basic Info
    fullName: "Maria Santos",
    email: "maria.santos@example.com",
    contactInfo: "+63 912 345 6789",
    agentId: null,
    branchId: "HO", // Head Office
    assignedRecruitmentOfficerId: null,
    applicationType: "direct_hire" as const,
    currentStage: "medical" as const,
    transferredToHO: false,
    transferredDate: null,
    status: "active" as const,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),

    // Personal Information
    dateOfBirth: Timestamp.fromDate(new Date('1995-03-15')),
    placeOfBirth: "Manila, Philippines",
    nationality: "Filipino",
    civilStatus: "single" as const,
    gender: "female" as const,
    positionApplied: "Domestic Helper",
    countryDestination: "Hong Kong",
    address: {
      present: "123 Main St, Manila, Philippines",
      permanent: "123 Main St, Manila, Philippines"
    },

    // Job Preferences
    preferredCountries: ["Hong Kong", "Singapore", "Taiwan"],
    preferredPositions: ["Domestic Helper", "Caregiver", "Nanny"],
    expectedSalary: {
      amount: 4630,
      currency: "HKD"
    },

    // Education
    education: [
      {
        level: "High School",
        course: "General Education",
        school: "Manila High School",
        yearCompleted: 2013
      },
      {
        level: "Vocational",
        course: "Caregiving NC II",
        school: "TESDA Training Center",
        yearCompleted: 2015
      }
    ],

    // Work Experience
    workExperience: [
      {
        company: "Hong Kong Family",
        position: "Domestic Helper",
        location: "Hong Kong",
        startDate: Timestamp.fromDate(new Date('2016-06-01')),
        endDate: Timestamp.fromDate(new Date('2018-06-01')),
        isOverseas: true
      },
      {
        company: "Singapore Family",
        position: "Nanny",
        location: "Singapore",
        startDate: Timestamp.fromDate(new Date('2019-01-01')),
        endDate: Timestamp.fromDate(new Date('2021-12-31')),
        isOverseas: true
      }
    ],

    // Skills
    skills: [
      "Child Care",
      "Elderly Care",
      "Cooking",
      "Housekeeping",
      "Basic First Aid",
      "English Communication"
    ],

    certifications: [
      "TESDA Caregiving NC II",
      "First Aid Training Certificate",
      "Basic Life Support (BLS)"
    ],

    languages: [
      {
        language: "Tagalog",
        proficiency: "native" as const
      },
      {
        language: "English",
        proficiency: "fluent" as const
      },
      {
        language: "Cantonese",
        proficiency: "basic" as const
      }
    ],

    // Medical Status
    medicalStatus: {
      examination: {
        date: Timestamp.fromDate(new Date('2024-01-15')),
        result: "passed" as const,
        facility: "Manila Medical Clinic"
      },
      conditions: [] as string[],
      allergies: [] as string[],
      vaccinations: [
        {
          name: "COVID-19",
          date: Timestamp.fromDate(new Date('2023-12-01'))
        },
        {
          name: "Hepatitis B",
          date: Timestamp.fromDate(new Date('2024-01-10'))
        }
      ]
    },

    // Deployment Info
    deployment: {
      employer: null,
      position: null,
      country: null,
      contractPeriod: null,
      salary: {
        amount: null,
        currency: null
      },
      startDate: null,
      endDate: null,
      status: null
    },

    // Emergency Contact
    emergencyContact: {
      name: "Juan Santos",
      relationship: "Father",
      contactNumber: "+63 912 345 6788",
      address: "123 Main St, Manila, Philippines"
    },

    // Public Resume Settings
    resumeVisible: true,
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    fullBodyPhotoUrl: null,
    passportCopyUrl: null
  },
  {
    // Second sample applicant
    fullName: "John Dela Cruz",
    email: "john.delacruz@example.com",
    contactInfo: "+63 917 654 3210",
    agentId: null,
    branchId: "HO",
    assignedRecruitmentOfficerId: null,
    applicationType: "direct_hire" as const,
    currentStage: "medical" as const,
    transferredToHO: false,
    transferredDate: null,
    status: "active" as const,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),

    dateOfBirth: Timestamp.fromDate(new Date('1990-08-20')),
    placeOfBirth: "Cebu, Philippines",
    nationality: "Filipino",
    civilStatus: "married" as const,
    gender: "male" as const,
    positionApplied: "Construction Worker",
    countryDestination: "Saudi Arabia",
    address: {
      present: "456 Elm St, Cebu City, Philippines",
      permanent: "456 Elm St, Cebu City, Philippines"
    },

    preferredCountries: ["Saudi Arabia", "UAE", "Qatar"],
    preferredPositions: ["Construction Worker", "Electrician", "Plumber"],
    expectedSalary: {
      amount: 1500,
      currency: "USD"
    },

    education: [
      {
        level: "High School",
        course: "General Education",
        school: "Cebu Technical School",
        yearCompleted: 2008
      },
      {
        level: "Vocational",
        course: "Electrical Installation & Maintenance NC II",
        school: "TESDA Training Center",
        yearCompleted: 2010
      }
    ],

    workExperience: [
      {
        company: "Saudi Construction Co.",
        position: "Electrician",
        location: "Riyadh, Saudi Arabia",
        startDate: Timestamp.fromDate(new Date('2011-03-01')),
        endDate: Timestamp.fromDate(new Date('2014-03-01')),
        isOverseas: true
      },
      {
        company: "Dubai Building Services",
        position: "Senior Electrician",
        location: "Dubai, UAE",
        startDate: Timestamp.fromDate(new Date('2015-06-01')),
        endDate: Timestamp.fromDate(new Date('2020-06-01')),
        isOverseas: true
      }
    ],

    skills: [
      "Electrical Wiring",
      "Equipment Installation",
      "Troubleshooting",
      "Safety Protocols",
      "Blueprint Reading",
      "Team Leadership"
    ],

    certifications: [
      "TESDA Electrical Installation & Maintenance NC II",
      "TESDA Construction Painting NC II",
      "Occupational Safety & Health Training"
    ],

    languages: [
      {
        language: "Tagalog",
        proficiency: "native" as const
      },
      {
        language: "English",
        proficiency: "fluent" as const
      },
      {
        language: "Arabic",
        proficiency: "intermediate" as const
      }
    ],

    medicalStatus: {
      examination: {
        date: Timestamp.fromDate(new Date('2024-02-01')),
        result: "passed" as const,
        facility: "Cebu Medical Center"
      },
      conditions: [] as string[],
      allergies: [] as string[],
      vaccinations: [
        {
          name: "COVID-19",
          date: Timestamp.fromDate(new Date('2023-11-15'))
        },
        {
          name: "Hepatitis B",
          date: Timestamp.fromDate(new Date('2024-01-25'))
        }
      ]
    },

    deployment: {
      employer: null,
      position: null,
      country: null,
      contractPeriod: null,
      salary: {
        amount: null,
        currency: null
      },
      startDate: null,
      endDate: null,
      status: null
    },

    emergencyContact: {
      name: "Ana Dela Cruz",
      relationship: "Wife",
      contactNumber: "+63 917 654 3211",
      address: "456 Elm St, Cebu City, Philippines"
    },

    resumeVisible: true,
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    fullBodyPhotoUrl: null,
    passportCopyUrl: null
  },
  {
    // Third sample applicant
    fullName: "Ana Marie Reyes",
    email: "ana.reyes@example.com",
    contactInfo: "+63 918 123 4567",
    agentId: null,
    branchId: "HO",
    assignedRecruitmentOfficerId: null,
    applicationType: "direct_hire" as const,
    currentStage: "medical" as const,
    transferredToHO: false,
    transferredDate: null,
    status: "active" as const,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),

    dateOfBirth: Timestamp.fromDate(new Date('1988-11-10')),
    placeOfBirth: "Davao, Philippines",
    nationality: "Filipino",
    civilStatus: "single" as const,
    gender: "female" as const,
    positionApplied: "Registered Nurse",
    countryDestination: "UK",
    address: {
      present: "789 Oak Ave, Davao City, Philippines",
      permanent: "789 Oak Ave, Davao City, Philippines"
    },

    preferredCountries: ["UK", "Canada", "Australia"],
    preferredPositions: ["Registered Nurse", "Healthcare Assistant", "Midwife"],
    expectedSalary: {
      amount: 2500,
      currency: "GBP"
    },

    education: [
      {
        level: "Bachelor's Degree",
        course: "Bachelor of Science in Nursing",
        school: "University of the Philippines",
        yearCompleted: 2010
      },
      {
        level: "Professional License",
        course: "Registered Nurse License",
        school: "Professional Regulation Commission",
        yearCompleted: 2010
      }
    ],

    workExperience: [
      {
        company: "Davao Medical Center",
        position: "Staff Nurse",
        location: "Davao City, Philippines",
        startDate: Timestamp.fromDate(new Date('2010-08-01')),
        endDate: Timestamp.fromDate(new Date('2015-07-31')),
        isOverseas: false
      },
      {
        company: "Royal Hospital London",
        position: "Registered Nurse",
        location: "London, UK",
        startDate: Timestamp.fromDate(new Date('2016-01-01')),
        endDate: Timestamp.fromDate(new Date('2022-12-31')),
        isOverseas: true
      }
    ],

    skills: [
      "Patient Care",
      "IV Administration",
      "Wound Care",
      "Electronic Health Records",
      "CPR/BLS",
      "Critical Thinking",
      "Team Collaboration"
    ],

    certifications: [
      "Philippine Registered Nurse License",
      "UK NMC Registration",
      "Basic Life Support (BLS)",
      "Advanced Cardiac Life Support (ACLS)",
      "Pediatric Advanced Life Support (PALS)"
    ],

    languages: [
      {
        language: "Tagalog",
        proficiency: "native" as const
      },
      {
        language: "English",
        proficiency: "fluent" as const
      }
    ],

    medicalStatus: {
      examination: {
        date: Timestamp.fromDate(new Date('2024-01-20')),
        result: "passed" as const,
        facility: "Davao Regional Hospital"
      },
      conditions: [] as string[],
      allergies: [] as string[],
      vaccinations: [
        {
          name: "COVID-19",
          date: Timestamp.fromDate(new Date('2023-10-15'))
        },
        {
          name: "Hepatitis B",
          date: Timestamp.fromDate(new Date('2023-12-01'))
        },
        {
          name: "Influenza",
          date: Timestamp.fromDate(new Date('2023-11-01'))
        }
      ]
    },

    deployment: {
      employer: null,
      position: null,
      country: null,
      contractPeriod: null,
      salary: {
        amount: null,
        currency: null
      },
      startDate: null,
      endDate: null,
      status: null
    },

    emergencyContact: {
      name: "Roberto Reyes",
      relationship: "Father",
      contactNumber: "+63 918 123 4566",
      address: "789 Oak Ave, Davao City, Philippines"
    },

    resumeVisible: true,
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    fullBodyPhotoUrl: null,
    passportCopyUrl: null
  }
];

export async function addSampleResumes() {
  try {
    console.log('Adding sample resumes to Firestore...');

    const applicantsRef = collection(firestore, 'applicants');
    const results = [];

    for (const applicant of sampleApplicants) {
      const docRef = await addDoc(applicantsRef, applicant);
      results.push({
        id: docRef.id,
        name: applicant.fullName,
        position: applicant.positionApplied,
        destination: applicant.countryDestination
      });
      console.log(`✓ Added: ${applicant.fullName} - ${applicant.positionApplied} (${applicant.countryDestination})`);
    }

    console.log(`\n✅ Successfully added ${sampleApplicants.length} sample resumes!`);
    console.log('\nRefresh the Employer Portal page to see them: http://localhost:3000/\n');

    return results;
  } catch (error) {
    console.error('❌ Error adding sample resumes:', error);
    throw error;
  }
}

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).addSampleResumes = addSampleResumes;
}
