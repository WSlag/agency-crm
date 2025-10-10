import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../../../components/documents/upload/FileUpload';
import { DocumentUploadForm } from '../../../components/documents/upload/DocumentUploadForm';
import { DocumentUploadModal } from '../../../components/documents/upload/DocumentUploadModal';
import { createMockFile, mockDocumentStore } from '../../utils/documentTestUtils';

// Mock the document store
jest.mock('../../../stores/documentStore', () => ({
  useDocumentStore: () => mockDocumentStore,
}));

describe('FileUpload Component', () => {
  const mockOnFileSelect = jest.fn();
  const mockOnFileRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area', () => {
    render(
      <FileUpload
        documentType="passport"
        onFileSelect={mockOnFileSelect}
        onFileRemove={mockOnFileRemove}
      />
    );

    expect(screen.getByText(/Upload a file/i)).toBeInTheDocument();
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(
      <FileUpload
        documentType="passport"
        onFileSelect={mockOnFileSelect}
        onFileRemove={mockOnFileRemove}
      />
    );

    const file = createMockFile();
    const input = screen.getByRole('button');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.drop(input, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it('validates file size', async () => {
    const largeFile = createMockFile('large.pdf', 'application/pdf', 10 * 1024 * 1024);
    
    render(
      <FileUpload
        documentType="passport"
        onFileSelect={mockOnFileSelect}
        onFileRemove={mockOnFileRemove}
      />
    );

    const input = screen.getByRole('button');

    Object.defineProperty(input, 'files', {
      value: [largeFile],
    });

    fireEvent.drop(input, {
      dataTransfer: {
        files: [largeFile],
      },
    });

    await waitFor(() => {
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });
});

describe('DocumentUploadForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    render(
      <DocumentUploadForm
        applicantId="1"
        documentType="passport"
        onSuccess={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Issue Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Document Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(
      <DocumentUploadForm
        applicantId="1"
        documentType="passport"
        onSuccess={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const file = createMockFile();
    const fileInput = screen.getByRole('button');
    const documentNumber = screen.getByLabelText(/Document Number/i);
    const submitButton = screen.getByText(/Upload Document/i);

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.drop(fileInput, {
      dataTransfer: {
        files: [file],
      },
    });

    fireEvent.change(documentNumber, { target: { value: 'ABC123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDocumentStore.uploadDocument).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    render(
      <DocumentUploadForm
        applicantId="1"
        documentType="passport"
        onSuccess={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText(/Upload Document/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDocumentStore.uploadDocument).not.toHaveBeenCalled();
    });
  });
});

describe('DocumentUploadModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={mockOnClose}
        applicantId="1"
        documentType="passport"
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal on cancel', () => {
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={mockOnClose}
        applicantId="1"
        documentType="passport"
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles successful upload', async () => {
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={mockOnClose}
        applicantId="1"
        documentType="passport"
        onSuccess={mockOnSuccess}
      />
    );

    const file = createMockFile();
    const fileInput = screen.getByRole('button');
    const documentNumber = screen.getByLabelText(/Document Number/i);
    const submitButton = screen.getByText(/Upload Document/i);

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.drop(fileInput, {
      dataTransfer: {
        files: [file],
      },
    });

    fireEvent.change(documentNumber, { target: { value: 'ABC123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDocumentStore.uploadDocument).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
