import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserList } from '../../../pages/admin/users/UserList';
import { AuthProvider } from '../../../contexts/AuthContext';
import { User } from '../../../types';

// Mock Firebase
jest.mock('../../../config/firebase', () => ({
  db: {},
}));

// Mock Firestore functions
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
jest.mock('firebase/firestore', () => ({
  collection: () => ({}),
  query: () => ({}),
  getDocs: (...args) => mockGetDocs(...args),
  doc: () => ({}),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
}));

// Mock sample users
const mockUsers: User[] = [
  {
    uid: '1',
    email: 'admin@example.com',
    displayName: 'Admin User',
    role: 'admin',
    branchId: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: '2',
    email: 'manager@example.com',
    displayName: 'Branch Manager',
    role: 'branch_manager',
    branchId: '1',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('UserList Component', () => {
  beforeEach(() => {
    mockGetDocs.mockClear();
    mockUpdateDoc.mockClear();
    mockDeleteDoc.mockClear();
    
    // Mock successful users fetch
    mockGetDocs.mockResolvedValue({
      docs: mockUsers.map(user => ({
        id: user.uid,
        data: () => user,
      })),
    });
  });

  const renderUserList = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <UserList />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    renderUserList();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders user list after loading', async () => {
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Branch Manager')).toBeInTheDocument();
    });
  });

  it('shows error message when users fetch fails', async () => {
    mockGetDocs.mockRejectedValue(new Error('Failed to fetch users'));
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });

  it('handles status change', async () => {
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  it('handles user deletion with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  it('does not delete user when confirmation is cancelled', async () => {
    window.confirm = jest.fn(() => false);
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('shows error message when status update fails', async () => {
    mockUpdateDoc.mockRejectedValue(new Error('Failed to update status'));
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    await waitFor(() => {
      expect(screen.getByText('Failed to update user status')).toBeInTheDocument();
    });
  });

  it('shows error message when deletion fails', async () => {
    window.confirm = jest.fn(() => true);
    mockDeleteDoc.mockRejectedValue(new Error('Failed to delete user'));
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });
  });
});
