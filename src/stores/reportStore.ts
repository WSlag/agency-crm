import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../config/firebase';
import type {
  Report,
  ReportTemplate,
  ReportSchedule,
  ReportFilter,
  ReportType,
  ReportFormat,
  DashboardMetrics,
} from '../types/report';
import { useAuthStore } from './authStore';

interface ReportState {
  reports: Report[];
  templates: ReportTemplate[];
  schedules: ReportSchedule[];
  selectedReport: Report | null;
  selectedTemplate: ReportTemplate | null;
  selectedSchedule: ReportSchedule | null;
  dashboardMetrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  filter: ReportFilter;
  sort: {
    field: keyof Report;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Actions
  setFilter: (filter: ReportFilter) => void;
  setSort: (sort: { field: keyof Report; direction: 'asc' | 'desc' }) => void;
  setPagination: (pagination: { page: number; limit: number; total: number }) => void;

  // Report Operations
  fetchReports: () => Promise<void>;
  fetchReportById: (id: string) => Promise<void>;
  generateReport: (
    name: string,
    type: ReportType,
    format: ReportFormat,
    filters: ReportFilter
  ) => Promise<string>;
  deleteReport: (id: string) => Promise<void>;

  // Template Operations
  fetchTemplates: () => Promise<void>;
  fetchTemplateById: (id: string) => Promise<void>;
  createTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTemplate: (id: string, template: Partial<ReportTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Schedule Operations
  fetchSchedules: () => Promise<void>;
  fetchScheduleById: (id: string) => Promise<void>;
  createSchedule: (schedule: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSchedule: (id: string, schedule: Partial<ReportSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Dashboard Operations
  fetchDashboardMetrics: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  templates: [],
  schedules: [],
  selectedReport: null,
  selectedTemplate: null,
  selectedSchedule: null,
  dashboardMetrics: null,
  loading: false,
  error: null,
  filter: {},
  sort: {
    field: 'generatedAt',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setPagination: (pagination) => set({ pagination }),

  fetchReports: async () => {
    try {
      set({ loading: true, error: null });
      const { filter, sort, pagination } = get();

      let q = collection(firestore, 'reports');

      // Apply filters
      if (filter.startDate) {
        q = query(q, where('generatedAt', '>=', filter.startDate));
      }
      if (filter.endDate) {
        q = query(q, where('generatedAt', '<=', filter.endDate));
      }
      if (filter.type) {
        q = query(q, where('type', '==', filter.type));
      }

      // Apply sorting
      q = query(q, orderBy(sort.field, sort.direction));

      // Apply pagination
      q = query(q, limit(pagination.limit));

      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          generatedAt: data.generatedAt?.toDate ? data.generatedAt.toDate() : data.generatedAt ? new Date(data.generatedAt) : new Date(),
        };
      }) as Report[];

      set({ reports, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch reports',
        loading: false,
      });
    }
  },

  fetchReportById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'reports', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          selectedReport: {
            id: docSnap.id,
            ...docSnap.data(),
          } as Report,
          loading: false,
        });
      } else {
        set({
          error: 'Report not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch report',
        loading: false,
      });
    }
  },

  generateReport: async (name, type, format, filters) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create report document
      const docRef = doc(collection(firestore, 'reports'));
      const timestamp = serverTimestamp();

      const reportData = {
        name,
        type,
        format,
        filters,
        status: 'generating' as const,
        generatedBy: user.uid,
        generatedAt: timestamp,
      };

      await setDoc(docRef, reportData);

      // Create audit log
      await setDoc(doc(collection(firestore, 'audit_logs')), {
        action: 'report_generated',
        entityId: docRef.id,
        entityType: 'report',
        performedBy: user.uid,
        performedAt: timestamp,
        details: reportData,
      });

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate report',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteReport: async (id) => {
    try {
      set({ loading: true, error: null });
      const report = get().selectedReport;

      if (report?.fileUrl) {
        // Delete report file from storage
        const storageRef = ref(storage, report.fileUrl);
        await deleteDoc(doc(firestore, 'reports', id));
      }

      // Delete report from Firestore
      await deleteDoc(doc(firestore, 'reports', id));

      set({
        reports: get().reports.filter((r) => r.id !== id),
        selectedReport: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete report',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      set({ loading: true, error: null });
      const snapshot = await getDocs(collection(firestore, 'report_templates'));
      const templates = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };
      }) as ReportTemplate[];

      set({ templates, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        loading: false,
      });
    }
  },

  fetchTemplateById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'report_templates', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          selectedTemplate: {
            id: docSnap.id,
            ...docSnap.data(),
          } as ReportTemplate,
          loading: false,
        });
      } else {
        set({
          error: 'Template not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch template',
        loading: false,
      });
    }
  },

  createTemplate: async (template) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const docRef = doc(collection(firestore, 'report_templates'));
      const timestamp = serverTimestamp();

      const templateData = {
        ...template,
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await setDoc(docRef, templateData);

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create template',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTemplate: async (id, template) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      await updateDoc(doc(firestore, 'report_templates', id), {
        ...template,
        updatedAt: timestamp,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update template',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTemplate: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'report_templates', id));

      set({
        templates: get().templates.filter((t) => t.id !== id),
        selectedTemplate: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete template',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchSchedules: async () => {
    try {
      set({ loading: true, error: null });
      const snapshot = await getDocs(collection(firestore, 'report_schedules'));
      const schedules = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          nextRunAt: data.nextRunAt?.toDate ? data.nextRunAt.toDate() : data.nextRunAt ? new Date(data.nextRunAt) : new Date(),
          lastRunAt: data.lastRunAt?.toDate ? data.lastRunAt.toDate() : data.lastRunAt ? new Date(data.lastRunAt) : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : new Date(),
        };
      }) as ReportSchedule[];

      set({ schedules, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch schedules',
        loading: false,
      });
    }
  },

  fetchScheduleById: async (id) => {
    try {
      set({ loading: true, error: null });
      const docRef = doc(firestore, 'report_schedules', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          selectedSchedule: {
            id: docSnap.id,
            ...docSnap.data(),
          } as ReportSchedule,
          loading: false,
        });
      } else {
        set({
          error: 'Schedule not found',
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch schedule',
        loading: false,
      });
    }
  },

  createSchedule: async (schedule) => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const docRef = doc(collection(firestore, 'report_schedules'));
      const timestamp = serverTimestamp();

      const scheduleData = {
        ...schedule,
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await setDoc(docRef, scheduleData);

      return docRef.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create schedule',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateSchedule: async (id, schedule) => {
    try {
      set({ loading: true, error: null });
      const timestamp = serverTimestamp();

      await updateDoc(doc(firestore, 'report_schedules', id), {
        ...schedule,
        updatedAt: timestamp,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update schedule',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteSchedule: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(firestore, 'report_schedules', id));

      set({
        schedules: get().schedules.filter((s) => s.id !== id),
        selectedSchedule: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete schedule',
        loading: false,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchDashboardMetrics: async () => {
    try {
      set({ loading: true, error: null });
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // TODO: Implement dashboard metrics calculation
      // This will involve multiple Firestore queries and data aggregation
      // For now, we'll return mock data
      const mockMetrics: DashboardMetrics = {
        applicants: {
          total: {
            name: 'Total Applicants',
            value: 0,
            trend: [],
          },
          pending: {
            name: 'Pending Applicants',
            value: 0,
            trend: [],
          },
          deployed: {
            name: 'Deployed Applicants',
            value: 0,
            trend: [],
          },
          transferRequests: {
            name: 'Transfer Requests',
            value: 0,
            trend: [],
          },
        },
        expenses: {
          total: {
            name: 'Total Expenses',
            value: 0,
            trend: [],
          },
          pending: {
            name: 'Pending Expenses',
            value: 0,
            trend: [],
          },
          approved: {
            name: 'Approved Expenses',
            value: 0,
            trend: [],
          },
          byType: {},
        },
        commissions: {
          total: {
            name: 'Total Commissions',
            value: 0,
            trend: [],
          },
          pending: {
            name: 'Pending Commissions',
            value: 0,
            trend: [],
          },
          paid: {
            name: 'Paid Commissions',
            value: 0,
            trend: [],
          },
          byType: {},
        },
        transfers: {
          total: {
            name: 'Total Transfers',
            value: 0,
            trend: [],
          },
          pending: {
            name: 'Pending Transfers',
            value: 0,
            trend: [],
          },
          approved: {
            name: 'Approved Transfers',
            value: 0,
            trend: [],
          },
          byBranch: {},
        },
        officers: {
          total: {
            name: 'Total Officers',
            value: 0,
            trend: [],
          },
          activeAssignments: {
            name: 'Active Assignments',
            value: 0,
            trend: [],
          },
          averageWorkload: {
            name: 'Average Workload',
            value: 0,
            trend: [],
          },
          byPerformance: {},
        },
      };

      set({ dashboardMetrics: mockMetrics, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard metrics',
        loading: false,
      });
    }
  },
}));
