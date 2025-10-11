import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateTestUser, generateTestTransfer } from '../setup/testUtils';
import { TransferService } from '../../services/branch/transferService';
import { NotificationService } from '../../services/notifications/notificationService';
import { TransferManagement } from '../../pages/applicants/TransferManagement';

// Mock services
jest.mock('../../services/branch/transferService');
jest.mock('../../services/notifications/notificationService');

describe('Transfer Workflow Integration Tests', () => {
  let transferService: jest.Mocked<TransferService>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    transferService = new TransferService() as jest.Mocked<TransferService>;
    notificationService = new NotificationService() as jest.Mocked<NotificationService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full transfer workflow successfully', async () => {
    // Setup test data
    const branchManager = generateTestUser({ role: 'branch_manager' });
    const transfer = generateTestTransfer();

    // Mock service responses
    transferService.initiateTransfer.mockResolvedValue(transfer.id);
    transferService.getTransferHistory.mockResolvedValue([transfer]);
    notificationService.sendNotification.mockResolvedValue('notification-id');

    // Render component
    render(<TransferManagement />, {
      initialProps: {
        user: branchManager,
      },
    });

    // Fill transfer request form
    fireEvent.change(screen.getByLabelText(/reason/i), {
      target: { value: 'Test transfer reason' },
    });

    // Submit transfer request
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Verify transfer request was created
    await waitFor(() => {
      expect(transferService.initiateTransfer).toHaveBeenCalledWith({
        applicantId: expect.any(String),
        fromBranchId: branchManager.branchId,
        toBranchId: expect.any(String),
        requestedBy: branchManager.id,
        reason: 'Test transfer reason',
      });
    });

    // Verify notification was sent
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'transfer_request',
      expect.any(String),
      expect.objectContaining({
        transferId: transfer.id,
      })
    );
  });

  it('should handle transfer approval workflow', async () => {
    // Setup test data
    const president = generateTestUser({ role: 'president' });
    const transfer = generateTestTransfer();
    const officerId = 'test-officer-id';

    // Mock service responses
    transferService.approveTransfer.mockResolvedValue();
    notificationService.sendNotification.mockResolvedValue('notification-id');

    // Render component
    render(<TransferManagement />, {
      initialProps: {
        user: president,
        transfer,
      },
    });

    // Select recruitment officer
    fireEvent.change(screen.getByLabelText(/assign officer/i), {
      target: { value: officerId },
    });

    // Approve transfer
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    // Verify transfer was approved
    await waitFor(() => {
      expect(transferService.approveTransfer).toHaveBeenCalledWith(
        transfer.id,
        president.id
      );
    });

    // Verify notifications were sent
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'transfer_approval',
      transfer.requestedBy,
      expect.objectContaining({
        transferId: transfer.id,
        status: 'approved',
      })
    );

    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'transfer_assignment',
      officerId,
      expect.objectContaining({
        transferId: transfer.id,
      })
    );
  });

  it('should handle transfer rejection workflow', async () => {
    // Setup test data
    const president = generateTestUser({ role: 'president' });
    const transfer = generateTestTransfer();

    // Mock service responses
    transferService.rejectTransfer.mockResolvedValue();
    notificationService.sendNotification.mockResolvedValue('notification-id');

    // Render component
    render(<TransferManagement />, {
      initialProps: {
        user: president,
        transfer,
      },
    });

    // Enter rejection reason
    fireEvent.change(screen.getByLabelText(/rejection reason/i), {
      target: { value: 'Test rejection reason' },
    });

    // Reject transfer
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));

    // Verify transfer was rejected
    await waitFor(() => {
      expect(transferService.rejectTransfer).toHaveBeenCalledWith(
        transfer.id,
        'Test rejection reason'
      );
    });

    // Verify notification was sent
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'transfer_rejection',
      transfer.requestedBy,
      expect.objectContaining({
        transferId: transfer.id,
        reason: 'Test rejection reason',
      })
    );
  });
});
