import { ReportGenerator } from '../../services/reportGenerator';
import { firestore } from '../../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  firestore: {
    collection: jest.fn(),
  },
}));

describe('ReportGenerator', () => {
  let generator: ReportGenerator;

  beforeEach(() => {
    generator = ReportGenerator.getInstance();
  });

  describe('generateExpenseReport', () => {
    const mockExpenses = [
      {
        id: '1',
        expenseType: 'travel',
        amount: 1000,
        currency: 'PHP',
        status: 'pending',
        expenseDate: Timestamp.fromDate(new Date('2024-01-15')),
        branchId: 'branch1',
      },
      {
        id: '2',
        expenseType: 'office',
        amount: 2000,
        currency: 'PHP',
        status: 'approved',
        expenseDate: Timestamp.fromDate(new Date('2024-01-20')),
        branchId: 'branch1',
      },
      {
        id: '3',
        expenseType: 'travel',
        amount: 1500,
        currency: 'PHP',
        status: 'pending',
        expenseDate: Timestamp.fromDate(new Date('2024-01-25')),
        branchId: 'branch2',
      },
    ];

    it('should generate expense report with correct summary', async () => {
      // Mock Firestore query
      const mockQuery = {
        docs: mockExpenses.map((expense) => ({
          id: expense.id,
          data: () => expense,
        })),
      };
      const mockGetDocs = jest.fn().mockResolvedValue(mockQuery);
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const report = await generator.generateExpenseReport({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(report.data).toHaveLength(3);
      expect(report.summary).toMatchObject({
        totalAmount: 4500,
        count: 3,
        averageAmount: 1500,
        minAmount: 1000,
        maxAmount: 2000,
        byStatus: {
          pending: {
            count: 2,
            amount: 2500,
          },
          approved: {
            count: 1,
            amount: 2000,
          },
        },
        byType: {
          travel: {
            count: 2,
            amount: 2500,
          },
          office: {
            count: 1,
            amount: 2000,
          },
        },
      });
    });

    it('should apply filters correctly', async () => {
      const mockQuery = {
        docs: mockExpenses
          .filter((e) => e.branchId === 'branch1')
          .map((expense) => ({
            id: expense.id,
            data: () => expense,
          })),
      };
      const mockGetDocs = jest.fn().mockResolvedValue(mockQuery);
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const report = await generator.generateExpenseReport({
        branchId: 'branch1',
      });

      expect(report.data).toHaveLength(2);
      expect(report.summary.totalAmount).toBe(3000);
    });
  });

  describe('generateCommissionReport', () => {
    const mockCommissions = [
      {
        id: '1',
        commissionType: 'recruitment',
        totalAmount: 5000,
        currency: 'PHP',
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date('2024-01-15')),
        agentId: 'agent1',
      },
      {
        id: '2',
        commissionType: 'deployment',
        totalAmount: 3000,
        currency: 'PHP',
        status: 'approved',
        createdAt: Timestamp.fromDate(new Date('2024-01-20')),
        agentId: 'agent1',
      },
      {
        id: '3',
        commissionType: 'recruitment',
        totalAmount: 4000,
        currency: 'PHP',
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date('2024-01-25')),
        agentId: 'agent2',
      },
    ];

    it('should generate commission report with correct summary', async () => {
      const mockQuery = {
        docs: mockCommissions.map((commission) => ({
          id: commission.id,
          data: () => commission,
        })),
      };
      const mockGetDocs = jest.fn().mockResolvedValue(mockQuery);
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const report = await generator.generateCommissionReport({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(report.data).toHaveLength(3);
      expect(report.summary).toMatchObject({
        totalAmount: 12000,
        count: 3,
        averageAmount: 4000,
        minAmount: 3000,
        maxAmount: 5000,
        byStatus: {
          pending: {
            count: 2,
            amount: 9000,
          },
          approved: {
            count: 1,
            amount: 3000,
          },
        },
        byType: {
          recruitment: {
            count: 2,
            amount: 9000,
          },
          deployment: {
            count: 1,
            amount: 3000,
          },
        },
      });
    });

    it('should apply filters correctly', async () => {
      const mockQuery = {
        docs: mockCommissions
          .filter((c) => c.agentId === 'agent1')
          .map((commission) => ({
            id: commission.id,
            data: () => commission,
          })),
      };
      const mockGetDocs = jest.fn().mockResolvedValue(mockQuery);
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const report = await generator.generateCommissionReport({
        agentId: 'agent1',
      });

      expect(report.data).toHaveLength(2);
      expect(report.summary.totalAmount).toBe(8000);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(generator.formatCurrency(1000)).toBe('₱1,000.00');
      expect(generator.formatCurrency(1234.56)).toBe('₱1,234.56');
      expect(generator.formatCurrency(0)).toBe('₱0.00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(generator.formatDate(date)).toBe('January 15, 2024');
    });
  });

  describe('generateCSV', () => {
    it('should generate CSV string correctly', () => {
      const data = [
        { id: '1', name: 'John', amount: 1000 },
        { id: '2', name: 'Jane, Doe', amount: 2000 },
      ];
      const fields = ['id', 'name', 'amount'];

      const csv = generator.generateCSV(data, fields);
      expect(csv).toBe(
        'id,name,amount\n1,"John",1000\n2,"Jane, Doe",2000'
      );
    });
  });
});
