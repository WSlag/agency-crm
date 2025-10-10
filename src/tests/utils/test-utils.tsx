import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock user roles
export const mockRoles = {
  admin: 'admin',
  president: 'president',
  ho_recruitment_officer: 'ho_recruitment_officer',
  ho_accountant: 'ho_accountant',
  branch_manager: 'branch_manager',
};

// Mock user data
export const mockUsers = {
  admin: {
    uid: 'admin-uid',
    email: 'admin@example.com',
    role: mockRoles.admin,
    displayName: 'Admin User',
  },
  branchManager: {
    uid: 'branch-manager-uid',
    email: 'branch@example.com',
    role: mockRoles.branch_manager,
    branchId: 'branch-1',
    displayName: 'Branch Manager',
  },
};

// Custom render function
function render(ui: React.ReactElement, { route = '/', ...renderOptions } = {}) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
}

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
};

// Mock Firebase Firestore
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
};

// Mock Firebase Storage
export const mockStorage = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
};

export * from '@testing-library/react';
export { render };
