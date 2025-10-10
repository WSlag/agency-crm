import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BranchList } from '../../../pages/admin/branches/BranchList';
import { AuthProvider } from '../../../contexts/AuthContext';
import { Branch } from '../../../types';

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

// Mock sample branches
const mockBranches: Branch[] = [
  {
    id: '1',
    branchName: 'Head Office',
    branchCode: 'HO',
    address: '123 Main St',
    contactInfo: 'contact@ho.com',
    isHeadOffice: true,
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: '2',
    branchName: 'Branch 1',
    branchCode: 'B1',
    address: '456 Side St',
    contactInfo: 'contact@b1.com',
    isHeadOffice: false,
    status: 'active',
    createdAt: new Date(),
  },
];

describe('BranchList Component', () => {
  beforeEach(() => {
    mockGetDocs.mockClear();
    mockUpdateDoc.mockClear();
    mockDeleteDoc.mockClear();
    
    // Mock successful branches fetch
    mockGetDocs.mockResolvedValue({
      docs: mockBranches.map(branch => ({
        id: branch.id,
        data: () => branch,
      })),
    });
  });

  const renderBranchList = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BranchList />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    renderBranchList();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders branch list after loading', async () => {
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Head Office')).toBeInTheDocument();
      expect(screen.getByText('Branch 1')).toBeInTheDocument();
    });
  });

  it('shows error message when branches fetch fails', async () => {
    mockGetDocs.mockRejectedValue(new Error('Failed to fetch branches'));
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch branches')).toBeInTheDocument();
    });
  });

  it('handles status change', async () => {
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Head Office')).toBeInTheDocument();
    });

    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  it('handles branch deletion with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Head Office')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  it('does not delete branch when confirmation is cancelled', async () => {
    window.confirm = jest.fn(() => false);
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Head Office')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  it('shows error message when status update fails', async () => {
    mockUpdateDoc.mockRejectedValue(new Error('Failed to update status'));
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Head Office')).toBeInTheDocument();
    });

    const statusSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    await waitFor(() => {
      expect(screen.getByText('Failed to update branch status')).toBeInTheDocument();
    });
  });

  it('shows error message when deletion fails', async () => {
    window.confirm = jest.fn(() => true);
    mockDeleteDoc.mockRejectedValue(new Error('Failed to delete branch'));
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Head Office')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete branch')).toBeInTheDocument();
    });
  });

  it('displays branch details correctly', async () => {
    renderBranchList();

    await waitFor(() => {
      expect(screen.getByText('Head Office')).toBeInTheDocument();
      expect(screen.getByText('HO')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('contact@ho.com')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument(); // isHeadOffice
    });
  });

  it('has working edit links', async () => {
    renderBranchList();

    await waitFor(() => {
      const editLinks = screen.getAllByText('Edit');
      expect(editLinks[0]).toHaveAttribute('href', '/admin/branches/1/edit');
      expect(editLinks[1]).toHaveAttribute('href', '/admin/branches/2/edit');
    });
  });

  it('has working add branch button', async () => {
    renderBranchList();

    await waitFor(() => {
      const addButton = screen.getByText('Add Branch');
      expect(addButton).toHaveAttribute('href', '/admin/branches/new');
    });
  });
});
