import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { configure } from '@testing-library/react';
import { vi } from 'vitest';

// Setup TextEncoder/TextDecoder for Node environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

global.indexedDB = indexedDB;

// Mock Service Worker
const serviceWorker = {
  register: vi.fn(),
  unregister: vi.fn(),
};

global.navigator.serviceWorker = serviceWorker;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver;
