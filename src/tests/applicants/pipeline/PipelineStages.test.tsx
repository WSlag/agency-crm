import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PipelineStages } from '../../../components/applicants/pipeline/PipelineStages';
import { ApplicantStage, ApplicantPipeline } from '../../../types/applicant';

const mockPipelineHistory: ApplicantPipeline[] = [
  {
    id: '1',
    applicantId: '1',
    stage: 'interview',
    enteredDate: new Date('2023-01-01'),
    completedDate: new Date('2023-01-15'),
    notes: 'Interview completed successfully',
    status: 'completed',
  },
];

const mockRequiredDocuments: { [key in ApplicantStage]: string[] } = {
  interview: ['passport', 'nbi_clearance'],
  medical: ['medical_cert'],
  processing: ['tesda_cert', 'owwa'],
  deployment: ['pdos', 'plane_ticket'],
  deployed: [],
};

const mockUploadedDocuments = {
  passport: {
    fileUrl: 'http://example.com/passport.pdf',
    status: 'verified' as const,
  },
  nbi_clearance: {
    fileUrl: 'http://example.com/nbi.pdf',
    status: 'pending' as const,
  },
};

describe('PipelineStages Component', () => {
  const mockOnStageUpdate = jest.fn();
  const mockOnDocumentUpload = jest.fn();

  const renderComponent = (currentStage: ApplicantStage = 'interview') => {
    render(
      <PipelineStages
        currentStage={currentStage}
        pipelineHistory={mockPipelineHistory}
        onStageUpdate={mockOnStageUpdate}
        requiredDocuments={mockRequiredDocuments}
        uploadedDocuments={mockUploadedDocuments}
        onDocumentUpload={mockOnDocumentUpload}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all pipeline stages', () => {
    renderComponent();

    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Medical')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Deployment')).toBeInTheDocument();
    expect(screen.getByText('Deployed')).toBeInTheDocument();
  });

  it('highlights current stage', () => {
    renderComponent('medical');

    const medicalStage = screen.getByText('Medical').closest('div');
    expect(medicalStage).toHaveClass('bg-blue-500');
  });

  it('shows completed stages with check mark', () => {
    renderComponent('medical');

    const interviewStage = screen.getByText('Interview').closest('div');
    expect(interviewStage).toHaveClass('bg-green-500');
  });

  it('shows required documents for current stage', () => {
    renderComponent();

    expect(screen.getByText('Passport')).toBeInTheDocument();
    expect(screen.getByText('NBI Clearance')).toBeInTheDocument();
  });

  it('shows document status indicators', () => {
    renderComponent();

    // Verified document
    const passportStatus = screen.getByTestId('document-status-passport');
    expect(passportStatus).toHaveClass('text-green-500');

    // Pending document
    const nbiStatus = screen.getByTestId('document-status-nbi_clearance');
    expect(nbiStatus).toHaveClass('text-yellow-500');
  });

  it('allows document upload', async () => {
    renderComponent();

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const uploadButton = screen.getAllByText('Upload')[0];
    const input = screen.getByTestId('file-upload-passport');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnDocumentUpload).toHaveBeenCalledWith(
        'interview',
        'passport',
        file
      );
    });
  });

  it('shows stage completion button when all documents are verified', () => {
    const verifiedDocuments = {
      passport: {
        fileUrl: 'http://example.com/passport.pdf',
        status: 'verified' as const,
      },
      nbi_clearance: {
        fileUrl: 'http://example.com/nbi.pdf',
        status: 'verified' as const,
      },
    };

    render(
      <PipelineStages
        currentStage="interview"
        pipelineHistory={mockPipelineHistory}
        onStageUpdate={mockOnStageUpdate}
        requiredDocuments={mockRequiredDocuments}
        uploadedDocuments={verifiedDocuments}
        onDocumentUpload={mockOnDocumentUpload}
      />
    );

    expect(screen.getByText('Complete & Move')).toBeInTheDocument();
  });

  it('calls onStageUpdate when completing stage', async () => {
    const verifiedDocuments = {
      passport: {
        fileUrl: 'http://example.com/passport.pdf',
        status: 'verified' as const,
      },
      nbi_clearance: {
        fileUrl: 'http://example.com/nbi.pdf',
        status: 'verified' as const,
      },
    };

    render(
      <PipelineStages
        currentStage="interview"
        pipelineHistory={mockPipelineHistory}
        onStageUpdate={mockOnStageUpdate}
        requiredDocuments={mockRequiredDocuments}
        uploadedDocuments={verifiedDocuments}
        onDocumentUpload={mockOnDocumentUpload}
      />
    );

    const completeButton = screen.getByText('Complete & Move');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnStageUpdate).toHaveBeenCalledWith('medical');
    });
  });

  it('shows pipeline history', () => {
    renderComponent();

    expect(screen.getByText('Pipeline History')).toBeInTheDocument();
    expect(screen.getByText('Interview completed successfully')).toBeInTheDocument();
    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
  });

  it('prevents stage completion when documents are pending', () => {
    renderComponent();

    const completeButton = screen.queryByText('Complete & Move');
    expect(completeButton).not.toBeInTheDocument();
  });

  it('shows loading state during stage update', async () => {
    mockOnStageUpdate.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));
    
    const verifiedDocuments = {
      passport: {
        fileUrl: 'http://example.com/passport.pdf',
        status: 'verified' as const,
      },
      nbi_clearance: {
        fileUrl: 'http://example.com/nbi.pdf',
        status: 'verified' as const,
      },
    };

    render(
      <PipelineStages
        currentStage="interview"
        pipelineHistory={mockPipelineHistory}
        onStageUpdate={mockOnStageUpdate}
        requiredDocuments={mockRequiredDocuments}
        uploadedDocuments={verifiedDocuments}
        onDocumentUpload={mockOnDocumentUpload}
      />
    );

    const completeButton = screen.getByText('Complete & Move');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(completeButton).toBeDisabled();
    });
  });
});
