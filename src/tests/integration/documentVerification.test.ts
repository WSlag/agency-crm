import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateTestUser, generateTestDocument } from '../setup/testUtils';
import { DocumentService } from '../../services/documents/documentService';
import { NotificationService } from '../../services/notifications/notificationService';
import { DocumentVerification } from '../../pages/documents/DocumentVerification';

// Mock services
jest.mock('../../services/documents/documentService');
jest.mock('../../services/notifications/notificationService');

describe('Document Verification Integration Tests', () => {
  let documentService: jest.Mocked<DocumentService>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    documentService = new DocumentService() as jest.Mocked<DocumentService>;
    notificationService = new NotificationService() as jest.Mocked<NotificationService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should complete document verification workflow successfully', async () => {
    // Setup test data
    const verifier = generateTestUser({ role: 'document_verifier' });
    const document = generateTestDocument();

    // Mock service responses
    documentService.verifyDocument.mockResolvedValue();
    documentService.trackDocument.mockResolvedValue({
      document,
      verificationHistory: [],
      uploadHistory: [],
    });
    notificationService.sendNotification.mockResolvedValue('notification-id');

    // Render component
    render(<DocumentVerification />, {
      initialProps: {
        user: verifier,
        document,
      },
    });

    // Add verification comments
    fireEvent.change(screen.getByLabelText(/comments/i), {
      target: { value: 'Document verified successfully' },
    });

    // Verify document
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    // Verify document service was called
    await waitFor(() => {
      expect(documentService.verifyDocument).toHaveBeenCalledWith(
        document.id,
        expect.objectContaining({
          status: 'verified',
          verifiedBy: verifier.id,
          comments: 'Document verified successfully',
        })
      );
    });

    // Verify notification was sent
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'document_verification',
      document.applicantId,
      expect.objectContaining({
        documentId: document.id,
        status: 'verified',
      })
    );
  });

  it('should handle document rejection workflow', async () => {
    // Setup test data
    const verifier = generateTestUser({ role: 'document_verifier' });
    const document = generateTestDocument();

    // Mock service responses
    documentService.verifyDocument.mockResolvedValue();
    notificationService.sendNotification.mockResolvedValue('notification-id');

    // Render component
    render(<DocumentVerification />, {
      initialProps: {
        user: verifier,
        document,
      },
    });

    // Add rejection reason
    fireEvent.change(screen.getByLabelText(/rejection reason/i), {
      target: { value: 'Document is unclear' },
    });

    // Reject document
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));

    // Verify document service was called
    await waitFor(() => {
      expect(documentService.verifyDocument).toHaveBeenCalledWith(
        document.id,
        expect.objectContaining({
          status: 'rejected',
          verifiedBy: verifier.id,
          comments: 'Document is unclear',
        })
      );
    });

    // Verify notification was sent
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'document_verification',
      document.applicantId,
      expect.objectContaining({
        documentId: document.id,
        status: 'rejected',
        reason: 'Document is unclear',
      })
    );
  });

  it('should handle document expiry notifications', async () => {
    // Setup test data
    const document = generateTestDocument({
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    });

    // Mock service responses
    documentService.trackDocument.mockResolvedValue({
      document,
      verificationHistory: [],
      uploadHistory: [],
    });

    // Render component
    render(<DocumentVerification />, {
      initialProps: {
        document,
      },
    });

    // Verify expiry warning is displayed
    expect(screen.getByText(/document expires in 25 days/i)).toBeInTheDocument();

    // Verify notification was sent
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'document_expiry',
      document.applicantId,
      expect.objectContaining({
        documentId: document.id,
        expiryDate: document.expiryDate,
        daysUntilExpiry: 25,
      })
    );
  });

  it('should enforce verification permissions', async () => {
    // Setup test data
    const regularUser = generateTestUser({ role: 'branch_manager' });
    const document = generateTestDocument();

    // Render component
    render(<DocumentVerification />, {
      initialProps: {
        user: regularUser,
        document,
      },
    });

    // Verify that verification buttons are not available
    expect(screen.queryByRole('button', { name: /verify/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();

    // Verify that the user sees a permission message
    expect(screen.getByText(/no permission to verify documents/i)).toBeInTheDocument();
  });
});
