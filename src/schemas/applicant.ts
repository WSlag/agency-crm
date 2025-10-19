import { z } from 'zod';

// Basic validation schemas
const addressSchema = z.object({
  present: z.string().min(5, 'Present address must be at least 5 characters'),
  permanent: z.string().min(5, 'Permanent address must be at least 5 characters'),
});

const salarySchema = z.object({
  amount: z.coerce.number().min(0, 'Salary amount must be positive'),
  currency: z.string().min(3, 'Currency code must be at least 3 characters'),
});

const educationSchema = z.object({
  level: z.string().min(2, 'Education level is required'),
  course: z.string().min(2, 'Course name is required'),
  school: z.string().min(2, 'School name is required'),
  yearCompleted: z.coerce.number().min(1900).max(new Date().getFullYear()),
});

const workExperienceSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  position: z.string().min(2, 'Position is required'),
  location: z.string().min(2, 'Location is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isOverseas: z.boolean(),
});

const languageSchema = z.object({
  language: z.string().min(2, 'Language name is required'),
  proficiency: z.enum(['basic', 'intermediate', 'fluent', 'native']),
});

const medicalStatusSchema = z.object({
  examination: z.object({
    date: z.coerce.date().nullable(),
    result: z.enum(['pending', 'passed', 'failed']).nullable(),
    facility: z.string(),
  }),
  conditions: z.array(z.string()),
  allergies: z.array(z.string()),
  vaccinations: z.array(z.object({
    name: z.string(),
    date: z.coerce.date(),
  })),
});

const deploymentSchema = z.object({
  employer: z.string().nullable(),
  position: z.string().nullable(),
  country: z.string().nullable(),
  contractPeriod: z.coerce.number().nullable(),
  salary: z.object({
    amount: z.coerce.number().nullable(),
    currency: z.string().nullable(),
  }),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  status: z.enum(['pending', 'processing', 'deployed', 'completed', 'cancelled']).nullable(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  relationship: z.string().min(2, 'Relationship is required'),
  contactNumber: z.string().min(5, 'Contact number is required'),
  address: z.string().min(5, 'Address is required'),
});

// Main applicant registration schema
export const applicantRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  contactInfo: z.string().min(5, 'Contact information must be at least 5 characters'),
  email: z.string().email('Invalid email address'),
  agentId: z.string().nullable(),
  branchId: z.string().min(1, 'Branch is required'),
  applicationType: z.enum(['with_agent', 'direct_hire']),
  
  // Personal Information
  dateOfBirth: z.coerce.date(),
  placeOfBirth: z.string().min(2, 'Place of birth is required'),
  nationality: z.string().min(2, 'Nationality is required'),
  civilStatus: z.enum(['single', 'married', 'widowed', 'divorced']),
  gender: z.enum(['male', 'female', 'other']),
  positionApplied: z.string().min(2, 'Position applied is required').optional(),
  countryDestination: z.string().min(2, 'Country destination is required').optional(),
  address: addressSchema,
  
  // Job Preferences
  preferredCountries: z.array(z.string().min(1)).min(1, 'At least one preferred country is required'),
  preferredPositions: z.array(z.string().min(1)).min(1, 'At least one preferred position is required'),
  expectedSalary: salarySchema.optional(),
  
  // Skills and Qualifications
  education: z.array(educationSchema).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(languageSchema).optional(),
  
  // Medical Information
  medicalStatus: medicalStatusSchema,
  
  // Emergency Contact
  emergencyContact: emergencyContactSchema,
}).refine(
  (data) => {
    // If applicationType is 'with_agent', agentId must be provided
    if (data.applicationType === 'with_agent') {
      return data.agentId !== null && data.agentId !== '';
    }
    return true;
  },
  {
    message: 'Agent is required when application type is "With Agent"',
    path: ['agentId'],
  }
);

// Transfer request schema
export const transferRequestSchema = z.object({
  applicantId: z.string(),
  fromBranchId: z.string(),
  toBranchId: z.string(),
  transferReason: z.string().min(10, 'Transfer reason must be at least 10 characters'),
  notes: z.string().optional(),
});

// Document upload schema
export const documentUploadSchema = z.object({
  applicantId: z.string(),
  documentType: z.enum([
    'passport',
    'nbi_clearance',
    'barangay_cert',
    'medical_cert',
    'tesda_cert',
    'owwa',
    'employment_contract',
    'pdos',
    'plane_ticket'
  ]),
  documentStage: z.enum(['interview', 'medical', 'processing', 'deployment', 'deployed']),
  file: z.instanceof(File),
});

// Pipeline update schema
export const pipelineUpdateSchema = z.object({
  applicantId: z.string(),
  stage: z.enum(['interview', 'medical', 'processing', 'deployment', 'deployed']),
  notes: z.string().optional(),
});

// Deployment update schema
export const deploymentUpdateSchema = z.object({
  applicantId: z.string(),
  deployment: deploymentSchema,
});
