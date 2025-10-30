// Script to add sample resume data for testing the Employer Portal landing page
// Run with: node scripts/addSampleResume.js

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Make sure you have your service account key file
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample resume data
const sampleApplicants = [
  {
    // Basic Info
    fullName: "Maria Santos",
    email: "maria.santos@example.com",
    contactInfo: "+63 912 345 6789",
    agentId: null,
    branchId: "HO", // Head Office
    assignedRecruitmentOfficerId: null,
    applicationType: "direct_hire",
    currentStage: "medical",
    transferredToHO: false,
    transferredDate: null,
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),

    // Personal Information
    dateOfBirth: admin.firestore.Timestamp.fromDate(new Date('1995-03-15')),
    placeOfBirth: "Manila, Philippines",
    nationality: "Filipino",
    civilStatus: "single",
    gender: "female",
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
        startDate: admin.firestore.Timestamp.fromDate(new Date('2016-06-01')),
        endDate: admin.firestore.Timestamp.fromDate(new Date('2018-06-01')),
        isOverseas: true
      },
      {
        company: "Singapore Family",
        position: "Nanny",
        location: "Singapore",
        startDate: admin.firestore.Timestamp.fromDate(new Date('2019-01-01')),
        endDate: admin.firestore.Timestamp.fromDate(new Date('2021-12-31')),
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
        proficiency: "native"
      },
      {
        language: "English",
        proficiency: "fluent"
      },
      {
        language: "Cantonese",
        proficiency: "basic"
      }
    ],

    // Medical Status
    medicalStatus: {
      examination: {
        date: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
        result: "passed",
        facility: "Manila Medical Clinic"
      },
      conditions: [],
      allergies: [],
      vaccinations: [
        {
          name: "COVID-19",
          date: admin.firestore.Timestamp.fromDate(new Date('2023-12-01'))
        },
        {
          name: "Hepatitis B",
          date: admin.firestore.Timestamp.fromDate(new Date('2024-01-10'))
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
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", // Sample photo
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
    applicationType: "direct_hire",
    currentStage: "medical",
    transferredToHO: false,
    transferredDate: null,
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),

    dateOfBirth: admin.firestore.Timestamp.fromDate(new Date('1990-08-20')),
    placeOfBirth: "Cebu, Philippines",
    nationality: "Filipino",
    civilStatus: "married",
    gender: "male",
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
        startDate: admin.firestore.Timestamp.fromDate(new Date('2011-03-01')),
        endDate: admin.firestore.Timestamp.fromDate(new Date('2014-03-01')),
        isOverseas: true
      },
      {
        company: "Dubai Building Services",
        position: "Senior Electrician",
        location: "Dubai, UAE",
        startDate: admin.firestore.Timestamp.fromDate(new Date('2015-06-01')),
        endDate: admin.firestore.Timestamp.fromDate(new Date('2020-06-01')),
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
        proficiency: "native"
      },
      {
        language: "English",
        proficiency: "fluent"
      },
      {
        language: "Arabic",
        proficiency: "intermediate"
      }
    ],

    medicalStatus: {
      examination: {
        date: admin.firestore.Timestamp.fromDate(new Date('2024-02-01')),
        result: "passed",
        facility: "Cebu Medical Center"
      },
      conditions: [],
      allergies: [],
      vaccinations: [
        {
          name: "COVID-19",
          date: admin.firestore.Timestamp.fromDate(new Date('2023-11-15'))
        },
        {
          name: "Hepatitis B",
          date: admin.firestore.Timestamp.fromDate(new Date('2024-01-25'))
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
    applicationType: "direct_hire",
    currentStage: "medical",
    transferredToHO: false,
    transferredDate: null,
    status: "active",
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),

    dateOfBirth: admin.firestore.Timestamp.fromDate(new Date('1988-11-10')),
    placeOfBirth: "Davao, Philippines",
    nationality: "Filipino",
    civilStatus: "single",
    gender: "female",
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
        startDate: admin.firestore.Timestamp.fromDate(new Date('2010-08-01')),
        endDate: admin.firestore.Timestamp.fromDate(new Date('2015-07-31')),
        isOverseas: false
      },
      {
        company: "Royal Hospital London",
        position: "Registered Nurse",
        location: "London, UK",
        startDate: admin.firestore.Timestamp.fromDate(new Date('2016-01-01')),
        endDate: admin.firestore.Timestamp.fromDate(new Date('2022-12-31')),
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
        proficiency: "native"
      },
      {
        language: "English",
        proficiency: "fluent"
      }
    ],

    medicalStatus: {
      examination: {
        date: admin.firestore.Timestamp.fromDate(new Date('2024-01-20')),
        result: "passed",
        facility: "Davao Regional Hospital"
      },
      conditions: [],
      allergies: [],
      vaccinations: [
        {
          name: "COVID-19",
          date: admin.firestore.Timestamp.fromDate(new Date('2023-10-15'))
        },
        {
          name: "Hepatitis B",
          date: admin.firestore.Timestamp.fromDate(new Date('2023-12-01'))
        },
        {
          name: "Influenza",
          date: admin.firestore.Timestamp.fromDate(new Date('2023-11-01'))
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

// Function to add sample applicants
async function addSampleResumes() {
  try {
    console.log('Starting to add sample resumes...\n');

    const applicantsRef = db.collection('applicants');

    for (const applicant of sampleApplicants) {
      const docRef = await applicantsRef.add(applicant);
      console.log(`✓ Added applicant: ${applicant.fullName} (ID: ${docRef.id})`);
      console.log(`  Position: ${applicant.positionApplied}`);
      console.log(`  Destination: ${applicant.countryDestination}`);
      console.log(`  Medical Status: ${applicant.medicalStatus.examination.result}`);
      console.log(`  Resume Visible: ${applicant.resumeVisible}\n`);
    }

    console.log(`\n✅ Successfully added ${sampleApplicants.length} sample resumes!`);
    console.log('\nYou can now view them on the Employer Portal at: http://localhost:3000/\n');

  } catch (error) {
    console.error('❌ Error adding sample resumes:', error);
  } finally {
    // Close the admin connection
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the script
addSampleResumes();
