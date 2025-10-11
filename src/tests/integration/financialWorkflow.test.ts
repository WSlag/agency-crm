import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateTestUser } from '../setup/testUtils';
import { CommissionService } from '../../services/financial/commissionService';
import { ExpenseService } from '../../services/financial/expenseService';
import { NotificationService } from '../../services/notifications/notificationService';
import { ExpenseApproval } from '../../components/expenses/ExpenseApproval';
import { CommissionCalculator } from '../../components/commissions/CommissionCalculator';

// Mock services
jest.mock('../../services/financial/commissionService');
jest.mock('../../services/financial/expenseService');
jest.mock('../../services/notifications/notificationService');

describe('Financial Workflow Integration Tests', () => {
  let commissionService: jest.Mocked<CommissionService>;
  let expenseService: jest.Mocked<ExpenseService>;
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    commissionService = new CommissionService() as jest.Mocked<CommissionService>;
    expenseService = new ExpenseService() as jest.Mocked<ExpenseService>;
    notificationService = new NotificationService() as jest.Mocked<NotificationService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Commission Workflow', () => {
    it('should calculate and approve commission correctly', async () => {
      // Setup test data
      const accountant = generateTestUser({ role: 'ho_accountant' });
      const applicantId = 'test-applicant-id';
      const commissionData = {
        applicantId,
        agentId: 'test-agent-id',
        amount: 5000,
        currency: 'PHP',
      };

      // Mock service responses
      commissionService.calculateCommission.mockResolvedValue({
        baseAmount: 5000,
        adjustments: [],
        totalAmount: 5000,
        ...commissionData,
      });
      commissionService.approveCommission.mockResolvedValue();
      notificationService.sendNotification.mockResolvedValue('notification-id');

      // Render component
      render(<CommissionCalculator />, {
        initialProps: {
          user: accountant,
          applicantId,
        },
      });

      // Calculate commission
      fireEvent.click(screen.getByRole('button', { name: /calculate/i }));

      // Verify calculation was performed
      await waitFor(() => {
        expect(commissionService.calculateCommission).toHaveBeenCalledWith(applicantId);
      });

      // Verify commission amount is displayed
      expect(screen.getByText(/₱5,000/)).toBeInTheDocument();

      // Approve commission
      fireEvent.click(screen.getByRole('button', { name: /approve/i }));

      // Verify commission was approved
      await waitFor(() => {
        expect(commissionService.approveCommission).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            approverId: accountant.id,
          })
        );
      });

      // Verify notification was sent
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        'commission_approval',
        commissionData.agentId,
        expect.objectContaining({
          amount: commissionData.amount,
          status: 'approved',
        })
      );
    });
  });

  describe('Expense Workflow', () => {
    it('should process expense approval workflow', async () => {
      // Setup test data
      const president = generateTestUser({ role: 'president' });
      const expense = {
        id: 'test-expense-id',
        amount: 1000,
        currency: 'PHP',
        type: 'travel',
        description: 'Travel expense',
        status: 'verified',
      };

      // Mock service responses
      expenseService.approveExpense.mockResolvedValue();
      notificationService.sendNotification.mockResolvedValue('notification-id');

      // Render component
      render(<ExpenseApproval />, {
        initialProps: {
          user: president,
          expense,
        },
      });

      // Add approval notes
      fireEvent.change(screen.getByLabelText(/notes/i), {
        target: { value: 'Expense approved' },
      });

      // Approve expense
      fireEvent.click(screen.getByRole('button', { name: /approve/i }));

      // Verify expense was approved
      await waitFor(() => {
        expect(expenseService.approveExpense).toHaveBeenCalledWith(
          expense.id,
          expect.objectContaining({
            approverId: president.id,
            notes: 'Expense approved',
          })
        );
      });

      // Verify notification was sent
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        'expense_approval',
        expect.any(String),
        expect.objectContaining({
          expenseId: expense.id,
          status: 'approved',
        })
      );
    });

    it('should enforce expense approval permissions', async () => {
      // Setup test data
      const branchManager = generateTestUser({ role: 'branch_manager' });
      const expense = {
        id: 'test-expense-id',
        amount: 1000,
        status: 'verified',
      };

      // Render component
      render(<ExpenseApproval />, {
        initialProps: {
          user: branchManager,
          expense,
        },
      });

      // Verify that approval buttons are not available
      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();

      // Verify that the user sees a permission message
      expect(screen.getByText(/no permission to approve expenses/i)).toBeInTheDocument();
    });
  });
});
