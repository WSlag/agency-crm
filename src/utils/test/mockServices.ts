import { vi } from 'vitest';
import { User } from 'firebase/auth';
import { Template } from '../../services/TemplateService';
import { Notification } from '../../services/NotificationService';
import { CustomClaims } from '../../types/auth';

export const mockUser: User = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2023-01-01T00:00:00Z',
    lastSignInTime: '2023-01-01T00:00:00Z'
  },
  phoneNumber: null,
  photoURL: null,
  providerData: [],
  providerId: 'firebase',
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn()
};

export const mockCustomClaims: CustomClaims = {
  role: 'admin',
  branchId: null
};

export const mockTemplate: Template = {
  id: 'test-template',
  name: 'Test Template',
  description: 'Test Description',
  documentType: 'passport',
  version: 1,
  fields: [
    {
      id: 'field-1',
      name: 'Test Field',
      type: 'text',
      required: true
    }
  ],
  isActive: true,
  isShared: false,
  createdBy: 'test-uid',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockNotification: Notification = {
  id: 'test-notification',
  userId: 'test-uid',
  title: 'Test Notification',
  message: 'Test Message',
  type: 'system',
  priority: 'low',
  channels: ['in-app'],
  read: false,
  createdAt: new Date()
};

export const mockAnalyticsData = {
  summary: {
    total: 1000,
    count: 10,
    average: 100
  },
  details: [
    {
      id: 'detail-1',
      amount: 100,
      createdAt: new Date()
    }
  ],
  metadata: {
    generatedAt: new Date(),
    filters: [],
    metrics: []
  }
};

export const mockServiceResponse = {
  success: (data: any) => ({
    ok: true,
    status: 200,
    json: async () => data
  }),
  error: (message: string, status = 400) => ({
    ok: false,
    status,
    json: async () => ({ error: message })
  })
};

export const mockFirebaseError = (code: string, message: string) => ({
  code,
  message,
  name: 'FirebaseError',
  stack: 'mock-stack'
});

export class MockFirestore {
  private data: Map<string, any> = new Map();

  collection(path: string) {
    return {
      doc: (id: string) => ({
        get: async () => ({
          exists: () => this.data.has(`${path}/${id}`),
          data: () => this.data.get(`${path}/${id}`),
          id
        }),
        set: async (data: any) => {
          this.data.set(`${path}/${id}`, data);
        },
        update: async (data: any) => {
          const existing = this.data.get(`${path}/${id}`) || {};
          this.data.set(`${path}/${id}`, { ...existing, ...data });
        },
        delete: async () => {
          this.data.delete(`${path}/${id}`);
        }
      }),
      add: async (data: any) => {
        const id = Math.random().toString(36).substring(7);
        this.data.set(`${path}/${id}`, data);
        return { id };
      },
      where: () => ({
        get: async () => ({
          docs: Array.from(this.data.entries())
            .filter(([key]) => key.startsWith(path))
            .map(([key, value]) => ({
              id: key.split('/')[1],
              data: () => value,
              exists: true
            }))
        })
      })
    };
  }

  clearData() {
    this.data.clear();
  }
}

export class MockStorage {
  private files: Map<string, Blob> = new Map();

  ref(path: string) {
    return {
      put: async (file: Blob) => {
        this.files.set(path, file);
        return { ref: { fullPath: path } };
      },
      getDownloadURL: async () => `https://example.com/${path}`,
      delete: async () => {
        this.files.delete(path);
      }
    };
  }

  clearFiles() {
    this.files.clear();
  }
}

export const mockIndexedDB = () => {
  const stores: { [key: string]: Map<string, any> } = {};

  return {
    open: () => ({
      result: {
        createObjectStore: (name: string) => {
          stores[name] = new Map();
          return {
            createIndex: vi.fn(),
            put: (value: any, key: string) => stores[name].set(key, value),
            get: (key: string) => stores[name].get(key),
            getAll: () => Array.from(stores[name].values()),
            clear: () => stores[name].clear()
          };
        },
        transaction: () => ({
          objectStore: (name: string) => ({
            put: (value: any, key: string) => stores[name].set(key, value),
            get: (key: string) => stores[name].get(key),
            getAll: () => Array.from(stores[name].values()),
            clear: () => stores[name].clear()
          })
        })
      }
    })
  };
};
