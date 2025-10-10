import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { mockUsers, mockAuth } from '../utils/test-utils';

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when user is not authenticated', async () => {
    mockAuth.currentUser = null;
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('renders children when user is authenticated and has correct role', async () => {
    mockAuth.currentUser = mockUsers.admin;
    
    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('redirects to dashboard when user lacks required role', async () => {
    mockAuth.currentUser = mockUsers.branchManager;
    
    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('shows loading state while checking authentication', () => {
    mockAuth.currentUser = null;
    mockAuth.onAuthStateChanged = vi.fn((callback) => {
      // Don't call callback immediately to simulate loading
      return () => {};
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles role-specific routes correctly', async () => {
    mockAuth.currentUser = mockUsers.branchManager;
    
    render(
      <ProtectedRoute allowedRoles={['branch_manager', 'admin']}>
        <div>Branch Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Branch Content')).toBeInTheDocument();
    });
  });
});