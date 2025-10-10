import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { ApplicantRegistration } from '../../pages/applicants/ApplicantRegistration';
import { mockUsers, mockFirestore } from '../utils/test-utils';

describe('ApplicantRegistration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockApplicantData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    currentStage: 'interview',
    branchId: 'branch-1',
  };

  it('renders all registration form steps', () => {
    render(<ApplicantRegistration />);
    
    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    expect(screen.getByText(/job preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/education & experience/i)).toBeInTheDocument();
    expect(screen.getByText(/medical information/i)).toBeInTheDocument();
    expect(screen.getByText(/emergency contact/i)).toBeInTheDocument();
  });

  it('validates required fields in personal information step', async () => {
    render(<ApplicantRegistration />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
    });
  });

  it('allows navigation between steps when fields are valid', async () => {
    render(<ApplicantRegistration />);
    
    // Fill personal information
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: mockApplicantData.fullName },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: mockApplicantData.email },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: mockApplicantData.phone },
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/job preferences/i)).toBeInTheDocument();
    });
  });

  it('submits form with complete applicant data', async () => {
    const mockAddDoc = vi.fn().mockResolvedValueOnce({ id: 'new-applicant-id' });
    mockFirestore.collection = vi.fn().mockReturnValueOnce({
      add: mockAddDoc,
    });

    render(<ApplicantRegistration />);
    
    // Fill all required fields
    // Personal Information
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: mockApplicantData.fullName },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: mockApplicantData.email },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: mockApplicantData.phone },
    });

    // Navigate through steps and submit
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Complete other steps...

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith(expect.objectContaining({
        fullName: mockApplicantData.fullName,
        email: mockApplicantData.email,
        phone: mockApplicantData.phone,
        currentStage: mockApplicantData.currentStage,
        branchId: mockApplicantData.branchId,
      }));
    });
  });

  it('handles form submission errors', async () => {
    const mockError = new Error('Failed to create applicant');
    mockFirestore.collection = vi.fn().mockReturnValueOnce({
      add: vi.fn().mockRejectedValueOnce(mockError),
    });

    render(<ApplicantRegistration />);
    
    // Fill required fields and submit
    // ... (similar to previous test)

    await waitFor(() => {
      expect(screen.getByText(/failed to create applicant/i)).toBeInTheDocument();
    });
  });
});