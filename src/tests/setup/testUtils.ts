import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    );
  };

  return render(ui, { wrapper: AllProviders, ...options });
};

// Mock Firebase Auth
const mockFirebaseAuth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
};

// Test data generators
const generateTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'branch_manager',
  branchId: 'test-branch-id',
  permissions: ['read', 'write'],
  verificationAccess: 'basic',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const generateTestDocument = (overrides = {}) => ({
  id: 'test-doc-id',
  type: 'passport',
  applicantId: 'test-applicant-id',
  fileUrl: 'https://example.com/test.pdf',
  verificationStatus: 'pending',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const generateTestTransfer = (overrides = {}) => ({
  id: 'test-transfer-id',
  applicantId: 'test-applicant-id',
  fromBranchId: 'test-branch-id',
  toBranchId: 'head-office-id',
  requestedBy: 'test-user-id',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock service worker handlers
const handlers = [
  // Add your MSW handlers here
];

export {
  customRender as render,
  mockFirebaseAuth,
  mockFirestore,
  generateTestUser,
  generateTestDocument,
  generateTestTransfer,
  handlers,
};
