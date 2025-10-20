import { create } from 'zustand';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { Job, CreateJobData, JobAssignment, JobAnalytics, ApplicationStatus } from '../types/job';

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  jobAssignments: JobAssignment[];
  loading: boolean;
  error: string | null;

  // Fetch operations
  fetchAllJobs: () => Promise<Job[]>;
  fetchActiveJobs: () => Promise<Job[]>;
  fetchJobById: (id: string) => Promise<void>;
  fetchJobsByStatus: (status: string) => Promise<Job[]>;

  // CRUD operations
  createJob: (data: CreateJobData) => Promise<string>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  // Assignment operations
  assignApplicantToJob: (jobId: string, applicantId: string, applicantName: string, notes?: string) => Promise<string>;
  updateAssignmentStatus: (assignmentId: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  fetchJobAssignments: (jobId: string) => Promise<JobAssignment[]>;
  removeAssignment: (assignmentId: string) => Promise<void>;

  // Analytics
  fetchJobAnalytics: (jobId: string) => Promise<JobAnalytics>;

  // State setters
  setSelectedJob: (job: Job | null) => void;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  selectedJob: null,
  jobAssignments: [],
  loading: false,
  error: null,

  fetchAllJobs: async () => {
    try {
      set({ loading: true, error: null });
      const jobsRef = collection(firestore, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const jobs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          jobTitle: data.jobTitle || '',
          employerName: data.employerName || '',
          country: data.country || '',
          location: data.location || '',
          salaryRange: data.salaryRange || { min: 0, max: 0, currency: 'PHP' },
          jobType: data.jobType || 'full-time',
          requirements: data.requirements || [],
          description: data.description || '',
          requiredSkills: data.requiredSkills || [],
          requiredCertifications: data.requiredCertifications || [],
          status: data.status || 'open',
          openings: data.openings || 1,
          filled: data.filled || 0,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate(),
        } as Job;
      });

      set({ jobs, loading: false });
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
        loading: false,
        jobs: []
      });
      return [];
    }
  },

  fetchActiveJobs: async () => {
    try {
      set({ loading: true, error: null });
      const jobsRef = collection(firestore, 'jobs');
      const q = query(jobsRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const jobs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          jobTitle: data.jobTitle || '',
          employerName: data.employerName || '',
          country: data.country || '',
          location: data.location || '',
          salaryRange: data.salaryRange || { min: 0, max: 0, currency: 'PHP' },
          jobType: data.jobType || 'full-time',
          requirements: data.requirements || [],
          description: data.description || '',
          requiredSkills: data.requiredSkills || [],
          requiredCertifications: data.requiredCertifications || [],
          status: data.status || 'open',
          openings: data.openings || 1,
          filled: data.filled || 0,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate(),
        } as Job;
      });

      set({ jobs, loading: false });
      return jobs;
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active jobs',
        loading: false,
        jobs: []
      });
      return [];
    }
  },

  fetchJobById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const jobRef = doc(firestore, 'jobs', id);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        throw new Error('Job not found');
      }

      const data = jobSnap.data();
      const job: Job = {
        id: jobSnap.id,
        jobTitle: data.jobTitle || '',
        employerName: data.employerName || '',
        country: data.country || '',
        location: data.location || '',
        salaryRange: data.salaryRange || { min: 0, max: 0, currency: 'PHP' },
        jobType: data.jobType || 'full-time',
        requirements: data.requirements || [],
        description: data.description || '',
        requiredSkills: data.requiredSkills || [],
        requiredCertifications: data.requiredCertifications || [],
        status: data.status || 'open',
        openings: data.openings || 1,
        filled: data.filled || 0,
        createdBy: data.createdBy || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        deadline: data.deadline?.toDate(),
      };

      set({ selectedJob: job, loading: false });
    } catch (error) {
      console.error('Error fetching job:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch job',
        loading: false,
      });
    }
  },

  fetchJobsByStatus: async (status: string) => {
    try {
      set({ loading: true, error: null });
      const jobsRef = collection(firestore, 'jobs');
      const q = query(jobsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const jobs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          jobTitle: data.jobTitle || '',
          employerName: data.employerName || '',
          country: data.country || '',
          location: data.location || '',
          salaryRange: data.salaryRange || { min: 0, max: 0, currency: 'PHP' },
          jobType: data.jobType || 'full-time',
          requirements: data.requirements || [],
          description: data.description || '',
          requiredSkills: data.requiredSkills || [],
          requiredCertifications: data.requiredCertifications || [],
          status: data.status || 'open',
          openings: data.openings || 1,
          filled: data.filled || 0,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deadline: data.deadline?.toDate(),
        } as Job;
      });

      set({ jobs, loading: false });
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs by status:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
        loading: false,
        jobs: []
      });
      return [];
    }
  },

  createJob: async (data: CreateJobData) => {
    try {
      set({ loading: true, error: null });

      const jobRef = doc(collection(firestore, 'jobs'));
      const jobData = {
        jobTitle: data.jobTitle,
        employerName: data.employerName,
        country: data.country,
        location: data.location,
        salaryRange: data.salaryRange,
        jobType: data.jobType,
        requirements: data.requirements,
        description: data.description,
        requiredSkills: data.requiredSkills,
        requiredCertifications: data.requiredCertifications,
        status: 'open',
        openings: data.openings,
        filled: 0,
        createdBy: 'current-user', // TODO: Get from auth context
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        deadline: data.deadline ? Timestamp.fromDate(data.deadline) : null,
      };

      await setDoc(jobRef, jobData);

      // Refresh jobs list
      await get().fetchAllJobs();

      set({ loading: false });
      return jobRef.id;
    } catch (error) {
      console.error('Error creating job:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create job',
        loading: false,
      });
      throw error;
    }
  },

  updateJob: async (id: string, data: Partial<Job>) => {
    try {
      set({ loading: true, error: null });

      const jobRef = doc(firestore, 'jobs', id);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // Convert Date objects to Timestamps
      if (data.deadline) {
        updateData.deadline = Timestamp.fromDate(data.deadline);
      }

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.createdBy;

      await updateDoc(jobRef, updateData);

      // Refresh jobs list
      await get().fetchAllJobs();

      // Update selected job if it's the one being updated
      if (get().selectedJob?.id === id) {
        await get().fetchJobById(id);
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error updating job:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update job',
        loading: false,
      });
      throw error;
    }
  },

  deleteJob: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const jobRef = doc(firestore, 'jobs', id);
      await deleteDoc(jobRef);

      // Refresh jobs list
      await get().fetchAllJobs();

      // Clear selected job if it's the one being deleted
      if (get().selectedJob?.id === id) {
        set({ selectedJob: null });
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error deleting job:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete job',
        loading: false,
      });
      throw error;
    }
  },

  assignApplicantToJob: async (jobId: string, applicantId: string, applicantName: string, notes: string = '') => {
    try {
      set({ loading: true, error: null });

      const assignmentData = {
        jobId,
        applicantId,
        applicantName,
        assignedBy: 'current-user', // TODO: Get from auth context
        assignedDate: Timestamp.now(),
        applicationStatus: 'applied',
        notes,
      };

      const assignmentRef = await addDoc(collection(firestore, 'job_assignments'), assignmentData);

      set({ loading: false });
      return assignmentRef.id;
    } catch (error) {
      console.error('Error assigning applicant:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to assign applicant',
        loading: false,
      });
      throw error;
    }
  },

  updateAssignmentStatus: async (assignmentId: string, status: ApplicationStatus, notes: string = '') => {
    try {
      set({ loading: true, error: null });

      const assignmentRef = doc(firestore, 'job_assignments', assignmentId);
      await updateDoc(assignmentRef, {
        applicationStatus: status,
        notes,
        updatedAt: Timestamp.now(),
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error updating assignment status:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update assignment status',
        loading: false,
      });
      throw error;
    }
  },

  fetchJobAssignments: async (jobId: string) => {
    try {
      set({ loading: true, error: null });

      const assignmentsRef = collection(firestore, 'job_assignments');
      const q = query(assignmentsRef, where('jobId', '==', jobId), orderBy('assignedDate', 'desc'));
      const snapshot = await getDocs(q);

      const assignments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          jobId: data.jobId,
          applicantId: data.applicantId,
          applicantName: data.applicantName,
          assignedBy: data.assignedBy,
          assignedDate: data.assignedDate?.toDate() || new Date(),
          applicationStatus: data.applicationStatus,
          notes: data.notes || '',
        } as JobAssignment;
      });

      set({ jobAssignments: assignments, loading: false });
      return assignments;
    } catch (error) {
      console.error('Error fetching job assignments:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch assignments',
        loading: false,
        jobAssignments: []
      });
      return [];
    }
  },

  removeAssignment: async (assignmentId: string) => {
    try {
      set({ loading: true, error: null });

      const assignmentRef = doc(firestore, 'job_assignments', assignmentId);
      await deleteDoc(assignmentRef);

      set({ loading: false });
    } catch (error) {
      console.error('Error removing assignment:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to remove assignment',
        loading: false,
      });
      throw error;
    }
  },

  fetchJobAnalytics: async (jobId: string) => {
    try {
      set({ loading: true, error: null });

      const assignmentsRef = collection(firestore, 'job_assignments');
      const q = query(assignmentsRef, where('jobId', '==', jobId));
      const snapshot = await getDocs(q);

      const totalApplications = snapshot.size;
      let interviewCount = 0;
      let offeredCount = 0;
      let acceptedCount = 0;
      let rejectedCount = 0;

      snapshot.docs.forEach(doc => {
        const status = doc.data().applicationStatus;
        if (status === 'interview') interviewCount++;
        if (status === 'offered') offeredCount++;
        if (status === 'accepted') acceptedCount++;
        if (status === 'rejected') rejectedCount++;
      });

      const fillRate = totalApplications > 0 ? (acceptedCount / totalApplications) * 100 : 0;

      const analytics: JobAnalytics = {
        jobId,
        totalApplications,
        interviewCount,
        offeredCount,
        acceptedCount,
        rejectedCount,
        fillRate,
      };

      set({ loading: false });
      return analytics;
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        loading: false,
      });
      throw error;
    }
  },

  setSelectedJob: (job: Job | null) => {
    set({ selectedJob: job });
  },

  clearError: () => {
    set({ error: null });
  },
}));

