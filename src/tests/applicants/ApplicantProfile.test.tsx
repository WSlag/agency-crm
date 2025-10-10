import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ApplicantProfile } from '../../pages/applicants/ApplicantProfile';
import { AuthProvider } from '../../contexts/AuthContext';
import { Applicant } from '../../types/applicant';

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: '1',
      role: 'branch_manager',
      branchId: 'branch1',
    },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the applicant store
const mockApplicant: Applicant = {
  id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  contactInfo: '1234567890',
  agentId: null,
  branchId: 'branch1',
  assignedRecruitmentOfficerId: null,
  applicationType: 'direct_hire',
  currentStage: 'interview',
  transferredToHO: false,
  transferredDate: null,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  dateOfBirth: new Date('1990-01-01'),
  placeOfBirth: 'New York',
  nationality: 'American',
  civilStatus: 'single',
  gender: 'male',
  address: {
    present: '123 Main St',
    permanent: '123 Main St',
  },
  preferredCountries: ['USA'],
  preferredPositions: ['Software Engineer'],
  expectedSalary: {
    amount: 5000,
    currency: 'USD',
  },
  education: [],
  workExperience: [],
  skills: [],
  certifications: [],
  languages: [],
  medicalStatus: {
    examination: {
      date: null,
      result: null,
      facility: '',
    },
    conditions: [],
    allergies: [],
    vaccinations: [],
  },
  deployment: {
    employer: null,
    position: null,
    country: null,
    contractPeriod: null,
    salary: {
      amount: null,
      currency: null,
    },
    startDate: null,
    endDate: null,
    status: null,
  },
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    contactNumber: '0987654321',
    address: '456 Side St',
  },
};

const mockApplicantStore = {
  selectedApplicant: mockApplicant,
  loading: false,
  error: null,
  fetchApplicantById: jest.fn(),
  updateApplicant: jest.fn(),
};

jest.mock('../../stores/applicantStore', () => ({
  useApplicantStore: () => mockApplicantStore,
}));

describe('ApplicantProfile Component', () => {
  const renderComponent = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ApplicantProfile />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders applicant profile header', () => {
    renderComponent();

    expect(screen.getByText(mockApplicant.fullName)).toBeInTheDocument();
    expect(screen.getByText(mockApplicant.email)).toBeInTheDocument();
    expect(screen.getByText(mockApplicant.contactInfo)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockApplicantStore.loading = true;
    renderComponent();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockApplicantStore.error = 'Failed to load applicant';
    renderComponent();

    expect(screen.getByText('Failed to load applicant')).toBeInTheDocument();
  });

  it('displays all profile tabs', () => {
    renderComponent();

    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Job Preferences')).toBeInTheDocument();
    expect(screen.getByText('Education & Experience')).toBeInTheDocument();
    expect(screen.getByText('Medical Info')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
  });

  it('allows navigation between tabs', async () => {
    renderComponent();

    const jobPreferencesTab = screen.getByText('Job Preferences');
    fireEvent.click(jobPreferencesTab);

    await waitFor(() => {
      expect(screen.getByText('Preferred Countries')).toBeInTheDocument();
      expect(screen.getByText('USA')).toBeInTheDocument();
    });

    const educationTab = screen.getByText('Education & Experience');
    fireEvent.click(educationTab);

    await waitFor(() => {
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('Work Experience')).toBeInTheDocument();
    });
  });

  it('shows status badge with correct color', () => {
    renderComponent();

    const statusBadge = screen.getByText('active');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('shows stage badge with correct color', () => {
    renderComponent();

    const stageBadge = screen.getByText('interview');
    expect(stageBadge).toBeInTheDocument();
  });

  it('shows edit button for authorized users', () => {
    renderComponent();

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('allows status change for authorized users', async () => {
    renderComponent();

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    await waitFor(() => {
      expect(mockApplicantStore.updateApplicant).toHaveBeenCalledWith(
        mockApplicant.id,
        expect.objectContaining({ status: 'inactive' })
      );
    });
  });

  it('displays emergency contact information', () => {
    renderComponent();

    const emergencyContactTab = screen.getByText('Emergency Contact');
    fireEvent.click(emergencyContactTab);

    expect(screen.getByText(mockApplicant.emergencyContact.name)).toBeInTheDocument();
    expect(screen.getByText(mockApplicant.emergencyContact.relationship)).toBeInTheDocument();
    expect(screen.getByText(mockApplicant.emergencyContact.contactNumber)).toBeInTheDocument();
    expect(screen.getByText(mockApplicant.emergencyContact.address)).toBeInTheDocument();
  });

  it('displays medical information', () => {
    renderComponent();

    const medicalInfoTab = screen.getByText('Medical Info');
    fireEvent.click(medicalInfoTab);

    expect(screen.getByText('Medical Examination')).toBeInTheDocument();
    expect(screen.getByText('Medical Conditions')).toBeInTheDocument();
    expect(screen.getByText('Allergies')).toBeInTheDocument();
    expect(screen.getByText('Vaccinations')).toBeInTheDocument();
  });
});
