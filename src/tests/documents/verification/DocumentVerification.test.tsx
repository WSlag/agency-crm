import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VerificationChecklist } from '../../../components/documents/verification/VerificationChecklist';
import { VerificationModal } from '../../../components/documents/verification/VerificationModal';
import { mockDocument, mockDocumentStore } from '../../utils/documentTestUtils';

// Mock the document store
jest.mock('../../../stores/documentStore', () => ({
  useDocumentStore: () => mockDocumentStore,
}));

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'user1',
      role: 'ho_recruitment_officer',
    },
  }),
}));

describe('VerificationChecklist Component', () => {
  const mockOnVerify = jest.fn();
  const mockOnReject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders checklist items', () => {
    render(
      <VerificationChecklist
        document={mockDocument}
        onVerify={mockOnVerify}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText('Document Verification Checklist')).toBeInTheDocument();
    expect(screen.getByText('Check passport number')).toBeInTheDocument();
    expect(screen.getByText('Verify expiry date')).toBeInTheDocument();
  });

  it('requires all items to be checked before verification', () => {
    render(
      <VerificationChecklist
        document={mockDocument}
        onVerify={mockOnVerify}
        onReject={mockOnReject}
      />
    );

    const verifyButton = screen.getByText('Verify Document');
    expect(verifyButton).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    expect(verifyButton).not.toBeDisabled();
  });

  it('handles verification submission', async () => {
    render(
      <VerificationChecklist
        document={mockDocument}
        onVerify={mockOnVerify}
        onReject={mockOnReject}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    const verifyButton = screen.getByText('Verify Document');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            checked: true,
          }),
        ])
      );
    });
  });

  it('handles rejection submission', async () => {
    render(
      <VerificationChecklist
        document={mockDocument}
        onVerify={mockOnVerify}
        onReject={mockOnReject}
      />
    );

    const rejectButton = screen.getByText('Reject Document');
    fireEvent.click(rejectButton);

    const reasonInput = screen.getByLabelText('Rejection Reason');
    fireEvent.change(reasonInput, {
      target: { value: 'Document is invalid' },
    });

    const confirmButton = screen.getByText('Confirm Rejection');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnReject).toHaveBeenCalledWith('Document is invalid');
    });
  });

  it('requires rejection reason', async () => {
    render(
      <VerificationChecklist
        document={mockDocument}
        onVerify={mockOnVerify}
        onReject={mockOnReject}
      />
    );

    const rejectButton = screen.getByText('Reject Document');
    fireEvent.click(rejectButton);

    const confirmButton = screen.getByText('Confirm Rejection');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnReject).not.toHaveBeenCalled();
    });
  });
});

describe('VerificationModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with document preview and checklist', () => {
    render(
      <VerificationModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Document Verification')).toBeInTheDocument();
    expect(screen.getByText('Document Preview')).toBeInTheDocument();
    expect(screen.getByText('Document Verification Checklist')).toBeInTheDocument();
  });

  it('handles successful verification', async () => {
    render(
      <VerificationModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
        onSuccess={mockOnSuccess}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      fireEvent.click(checkbox);
    });

    const verifyButton = screen.getByText('Verify Document');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockDocumentStore.verifyDocument).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles document rejection', async () => {
    render(
      <VerificationModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
        onSuccess={mockOnSuccess}
      />
    );

    const rejectButton = screen.getByText('Reject Document');
    fireEvent.click(rejectButton);

    const reasonInput = screen.getByLabelText('Rejection Reason');
    fireEvent.change(reasonInput, {
      target: { value: 'Document is invalid' },
    });

    const confirmButton = screen.getByText('Confirm Rejection');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDocumentStore.rejectDocument).toHaveBeenCalledWith(
        mockDocument.id,
        'Document is invalid'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('closes modal on cancel', () => {
    render(
      <VerificationModal
        isOpen={true}
        onClose={mockOnClose}
        document={mockDocument}
        onSuccess={mockOnSuccess}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
