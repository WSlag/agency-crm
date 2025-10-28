import { create } from 'zustand';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { firestore as db } from '../config/firebase';
import { Applicant } from '../types/applicant';
import { PublicResume, AgencyInfo, EmployerInquiry, ResumeFilters } from '../types/resume';
import { convertToPublicResume, matchesSearchTerm, sortApplicants } from '../services/resumeBuilder';

interface ResumeState {
  // State
  publicResumes: PublicResume[];
  agencyInfo: AgencyInfo | null;
  loading: boolean;
  error: string | null;
  filters: ResumeFilters;
  sortBy: 'name' | 'age' | 'experience' | 'date';

  // Actions
  fetchPublicResumes: () => Promise<void>;
  fetchAgencyInfo: () => Promise<void>;
  submitInquiry: (inquiry: Omit<EmployerInquiry, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  setFilters: (filters: ResumeFilters) => void;
  setSortBy: (sortBy: 'name' | 'age' | 'experience' | 'date') => void;
  getFilteredResumes: () => PublicResume[];
  clearFilters: () => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  // Initial state
  publicResumes: [],
  agencyInfo: null,
  loading: false,
  error: null,
  filters: {},
  sortBy: 'date',

  // Fetch public resumes (only those with medical passed and resumeVisible = true)
  fetchPublicResumes: async () => {
    set({ loading: true, error: null });
    try {
      const applicantsRef = collection(db, 'applicants');

      // Query for applicants with medical passed and resume visible
      const q = query(
        applicantsRef,
        where('resumeVisible', '==', true),
        where('medicalStatus.examination.result', '==', 'passed'),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      const applicants: Applicant[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applicants.push({
          id: doc.id,
          ...data,
          dateOfBirth: data.dateOfBirth?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          transferredDate: data.transferredDate?.toDate(),
          stageEnteredAt: data.stageEnteredAt?.toDate(),
          stageCompletedAt: data.stageCompletedAt?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          commissionMedicalTriggeredAt: data.commissionMedicalTriggeredAt?.toDate(),
          commissionDeploymentTriggeredAt: data.commissionDeploymentTriggeredAt?.toDate(),
          medicalStatus: {
            ...data.medicalStatus,
            examination: {
              ...data.medicalStatus.examination,
              date: data.medicalStatus.examination.date?.toDate() || null,
            },
            vaccinations: data.medicalStatus.vaccinations.map((v: any) => ({
              ...v,
              date: v.date?.toDate(),
            })),
          },
          workExperience: data.workExperience.map((exp: any) => ({
            ...exp,
            startDate: exp.startDate?.toDate(),
            endDate: exp.endDate?.toDate() || null,
          })),
          deployment: {
            ...data.deployment,
            startDate: data.deployment.startDate?.toDate() || null,
            endDate: data.deployment.endDate?.toDate() || null,
          },
          employerDetails: data.employerDetails
            ? {
                ...data.employerDetails,
                addedAt: data.employerDetails.addedAt?.toDate() || null,
              }
            : undefined,
        } as Applicant);
      });

      const publicResumes = applicants.map(convertToPublicResume);
      set({ publicResumes, loading: false });
    } catch (error: any) {
      console.error('Error fetching public resumes:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch agency information
  fetchAgencyInfo: async () => {
    try {
      const agencyInfoRef = collection(db, 'agency_info');
      const q = query(agencyInfoRef, firestoreLimit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const agencyInfo: AgencyInfo = {
          id: doc.id,
          agencyName: data.agencyName,
          logoUrl: data.logoUrl,
          tagline: data.tagline,
          about: data.about,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          socialMedia: data.socialMedia,
          licenseNumber: data.licenseNumber,
          updatedAt: data.updatedAt?.toDate(),
          updatedBy: data.updatedBy,
        };
        set({ agencyInfo });
      }
    } catch (error: any) {
      console.error('Error fetching agency info:', error);
    }
  },

  // Submit employer inquiry
  submitInquiry: async (inquiry) => {
    try {
      const inquiriesRef = collection(db, 'employer_inquiries');
      await addDoc(inquiriesRef, {
        ...inquiry,
        status: 'new',
        createdAt: Timestamp.now(),
      });
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      throw new Error('Failed to submit inquiry. Please try again.');
    }
  },

  // Set filters
  setFilters: (filters) => {
    set({ filters });
  },

  // Set sort order
  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {} });
  },

  // Get filtered and sorted resumes
  getFilteredResumes: () => {
    const { publicResumes, filters, sortBy } = get();

    // Convert PublicResume back to Applicant for filtering/sorting
    // This is a simplified conversion - we only need the fields used in filtering
    const applicantsForFiltering: Applicant[] = publicResumes.map((resume) => ({
      id: resume.id,
      fullName: resume.fullName,
      email: resume.email,
      nationality: resume.nationality,
      gender: resume.gender,
      civilStatus: resume.civilStatus,
      dateOfBirth: resume.dateOfBirth,
      positionApplied: resume.positionApplied,
      countryDestination: resume.countryDestination,
      preferredCountries: resume.preferredCountries,
      preferredPositions: resume.preferredPositions,
      expectedSalary: resume.expectedSalary,
      education: resume.education,
      workExperience: resume.workExperience,
      skills: resume.skills,
      certifications: resume.certifications,
      languages: resume.languages,
      createdAt: resume.createdAt,
      medicalStatus: {
        examination: {
          date: resume.medicalExaminationDate,
          result: 'passed',
          facility: '',
        },
        conditions: [],
        allergies: [],
        vaccinations: [],
      },
      // Required fields with dummy values
      contactInfo: '',
      agentId: null,
      branchId: '',
      assignedRecruitmentOfficerId: null,
      applicationType: 'direct_hire',
      currentStage: 'medical',
      transferredToHO: false,
      transferredDate: null,
      status: 'active',
      updatedAt: new Date(),
      placeOfBirth: '',
      address: { present: '', permanent: '' },
      emergencyContact: { name: '', relationship: '', contactNumber: '', address: '' },
      deployment: {
        employer: null,
        position: null,
        country: null,
        contractPeriod: null,
        salary: { amount: null, currency: null },
        startDate: null,
        endDate: null,
        status: null,
      },
    })) as Applicant[];

    // Apply filters
    let filtered = applicantsForFiltering;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter((applicant) =>
        matchesSearchTerm(applicant, filters.search!)
      );
    }

    // Country filter
    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter((applicant) =>
        filters.countries!.some(
          (country) =>
            applicant.preferredCountries.includes(country) ||
            applicant.countryDestination === country
        )
      );
    }

    // Position filter
    if (filters.positions && filters.positions.length > 0) {
      filtered = filtered.filter((applicant) =>
        filters.positions!.some(
          (position) =>
            applicant.preferredPositions.includes(position) ||
            applicant.positionApplied === position
        )
      );
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter((applicant) =>
        filters.skills!.some((skill) =>
          applicant.skills.some((s) =>
            s.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(
        (applicant) => applicant.gender === filters.gender
      );
    }

    // Civil status filter
    if (filters.civilStatus && filters.civilStatus.length > 0) {
      filtered = filtered.filter((applicant) =>
        filters.civilStatus!.includes(applicant.civilStatus)
      );
    }

    // Age filter
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      const today = new Date();
      filtered = filtered.filter((applicant) => {
        const birthDate = new Date(applicant.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        if (filters.minAge !== undefined && age < filters.minAge) return false;
        if (filters.maxAge !== undefined && age > filters.maxAge) return false;
        return true;
      });
    }

    // Language filter
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter((applicant) =>
        filters.languages!.some((lang) =>
          applicant.languages.some(
            (l) => l.language.toLowerCase() === lang.toLowerCase()
          )
        )
      );
    }

    // Sort
    const sorted = sortApplicants(filtered, sortBy);

    // Convert back to PublicResume
    return sorted.map(convertToPublicResume);
  },
}));
