import { User } from 'firebase/auth';
import { UserRole } from '../types/auth';

export const createMockUser = (overrides = {}): User => ({
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
  delete: jest.fn(),
  getIdToken: jest.fn(),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
  ...overrides
});

export const createMockCustomClaims = (role: UserRole, branchId?: string) => ({
  role,
  branchId: branchId || null
});

export const createMockAuthState = (
  user: Partial<User> = {},
  role: UserRole = 'admin',
  branchId?: string
) => ({
  user: createMockUser(user),
  customClaims: createMockCustomClaims(role, branchId),
  loading: false,
  error: null,
  signIn: jest.fn(),
  signOut: jest.fn()
});

export const mockFirebaseResponse = <T>(data: T) => ({
  data: () => data,
  id: 'mock-id',
  exists: () => true,
  ref: {
    path: 'mock/path'
  }
});

export const createMockDocument = (data = {}) => ({
  id: 'test-doc-id',
  type: 'passport',
  status: 'pending',
  applicantId: 'test-applicant-id',
  applicantName: 'Test Applicant',
  documentUrl: 'https://example.com/test.pdf',
  submittedAt: new Date(),
  ...data
});

export const mockConsoleError = () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
};
