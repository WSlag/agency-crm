import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { TransferManagement } from '../../../pages/applicants/TransferManagement';
import { mockUsers, mockFirestore } from '../../utils/test-utils';

describe('Transfer Workflow', () => {
  const mockApplicant = {
    id: 'applicant-1',
    fullName: 'John Doe',
    currentStage: 'processing',
    branchId: 'branch-1',
    transferredToHO: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Firestore getData
    mockFirestore.doc = vi.fn().mockReturnValueOnce({
      get: vi.fn().mockResolvedValueOnce({
        data: () => mockApplicant,
        exists: true,
      }),
    });
  });

  it('allows branch manager to initiate transfer request', async () => {
    const mockCreateTransfer = vi.fn().mockResolvedValueOnce({ id: 'transfer-1' });
    mockFirestore.collection = vi.fn().mockReturnValueOnce({
      add: mockCreateTransfer,
    });

    render(<TransferManagement applicantId={mockApplicant.id} />, {
      user: mockUsers.branchManager,
    });

    // Fill transfer request form
    fireEvent.change(screen.getByLabelText(/reason for transfer/i), {
      target: { value: 'Ready for head office processing' },
    });

    const submitButton = screen.getByRole('button', { name: /request transfer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          applicantId: mockApplicant.id,
          fromBranchId: 'branch-1',
          status: 'pending',
          reason: 'Ready for head office processing',
        })
      );
    });
  });

  it('allows admin to approve transfer request', async () => {
    const mockTransfer = {
      id: 'transfer-1',
      applicantId: mockApplicant.id,
      fromBranchId: 'branch-1',
      status: 'pending',
      reason: 'Ready for head office processing',
    };

    mockFirestore.doc = vi.fn()
      .mockReturnValueOnce({
        get: vi.fn().mockResolvedValueOnce({
          data: () => mockTransfer,
          exists: true,
        }),
      });

    const mockUpdateTransfer = vi.fn().mockResolvedValueOnce({});
    mockFirestore.collection = vi.fn().mockReturnValueOnce({
      doc: vi.fn().mockReturnValueOnce({
        update: mockUpdateTransfer,
      }),
    });

    render(<TransferManagement transferId={mockTransfer.id} />, {
      user: mockUsers.admin,
    });

    const approveButton = screen.getByRole('button', { name: /approve transfer/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockUpdateTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'approved',
          approvedBy: mockUsers.admin.uid,
          approvedAt: expect.any(Date),
        })
      );
    });
  });

  it('allows assigning HO recruitment officer after approval', async () => {
    const mockTransfer = {
      id: 'transfer-1',
      applicantId: mockApplicant.id,
      status: 'approved',
    };

    const mockOfficer = {
      id: 'officer-1',
      displayName: 'HO Officer',
      role: 'ho_recruitment_officer',
    };

    mockFirestore.doc = vi.fn()
      .mockReturnValueOnce({
        get: vi.fn().mockResolvedValueOnce({
          data: () => mockTransfer,
          exists: true,
        }),
      });

    const mockAssignOfficer = vi.fn().mockResolvedValueOnce({});
    mockFirestore.collection = vi.fn().mockReturnValueOnce({
      doc: vi.fn().mockReturnValueOnce({
        update: mockAssignOfficer,
      }),
    });

    render(<TransferManagement transferId={mockTransfer.id} />, {
      user: mockUsers.admin,
    });

    // Select officer
    fireEvent.change(screen.getByLabelText(/select officer/i), {
      target: { value: mockOfficer.id },
    });

    const assignButton = screen.getByRole('button', { name: /assign officer/i });
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(mockAssignOfficer).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedOfficerId: mockOfficer.id,
          status: 'assigned',
        })
      );
    });
  });

  it('restricts branch access to view-only after transfer', async () => {
    const mockTransferredApplicant = {
      ...mockApplicant,
      transferredToHO: true,
      assignedOfficerId: 'officer-1',
    };

    mockFirestore.doc = vi.fn().mockReturnValueOnce({
      get: vi.fn().mockResolvedValueOnce({
        data: () => mockTransferredApplicant,
        exists: true,
      }),
    });

    render(<TransferManagement applicantId={mockApplicant.id} />, {
      user: mockUsers.branchManager,
    });

    await waitFor(() => {
      expect(screen.getByText(/view only/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });
  });
});