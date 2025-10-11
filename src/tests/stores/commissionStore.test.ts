import { renderHook, act } from '@testing-library/react-hooks';
import { useCommissionStore } from '../../stores/commissionStore';
import { firestore } from '../../config/firebase';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

describe('commissionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCommissions', () => {
    it('should fetch commissions and update state', async () => {
      const mockCommissions = [
        {
          id: '1',
          commissionType: 'recruitment',
          totalAmount: 5000,
          status: 'pending',
        },
        {
          id: '2',
          commissionType: 'deployment',
          totalAmount: 3000,
          status: 'approved',
        },
      ];

      const mockQuery = {
        docs: mockCommissions.map((commission) => ({
          id: commission.id,
          data: () => commission,
        })),
      };

      const mockGetDocs = jest.fn().mockResolvedValue(mockQuery);
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockCollection = jest.fn().mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
        limit: mockLimit,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        await result.current.fetchCommissions();
      });

      expect(result.current.commissions).toHaveLength(2);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when fetching commissions', async () => {
      const mockError = new Error('Failed to fetch commissions');
      const mockGetDocs = jest.fn().mockRejectedValue(mockError);
      const mockCollection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        await result.current.fetchCommissions();
      });

      expect(result.current.commissions).toHaveLength(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('createCommission', () => {
    it('should create a new commission and update state', async () => {
      const mockCommission = {
        commissionType: 'recruitment',
        totalAmount: 5000,
        status: 'pending',
      };

      const mockDocRef = {
        id: '1',
      };

      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue(mockDocRef);
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        await result.current.createCommission(mockCommission as any);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when creating commission', async () => {
      const mockError = new Error('Failed to create commission');
      const mockSetDoc = jest.fn().mockRejectedValue(mockError);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        try {
          await result.current.createCommission({} as any);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('verifyCommission', () => {
    it('should verify commission and update state', async () => {
      const mockVerification = {
        commissionId: '1',
        status: 'verified' as const,
        verifiedBy: 'user1',
        notes: 'Verified',
      };

      const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        await result.current.verifyCommission(mockVerification);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when verifying commission', async () => {
      const mockError = new Error('Failed to verify commission');
      const mockUpdateDoc = jest.fn().mockRejectedValue(mockError);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        try {
          await result.current.verifyCommission({} as any);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('calculateCommission', () => {
    it('should calculate commission correctly', () => {
      const { result } = renderHook(() => useCommissionStore());

      const calculation = result.current.calculateCommission(
        'recruitment',
        100000,
        {
          applicantCount: 6,
          placementDays: 25,
          salary: 120000,
        }
      );

      expect(calculation.baseAmount).toBe(10000); // 10% base rate
      expect(calculation.bonusAmount).toBeGreaterThan(0);
      expect(calculation.calculationDetails.baseRate).toBe(0.1);
      expect(calculation.calculationDetails.bonusRate).toBe(0.12);
      expect(calculation.calculationDetails.multipliers?.length).toBe(2);
    });

    it('should handle invalid calculation parameters', () => {
      const { result } = renderHook(() => useCommissionStore());

      const calculation = result.current.calculateCommission(
        'recruitment',
        -1000,
        {}
      );

      expect(calculation.baseAmount).toBe(0);
      expect(calculation.bonusAmount).toBe(0);
      expect(calculation.totalAmount).toBe(0);
    });
  });

  describe('approveCommission', () => {
    it('should approve commission and update state', async () => {
      const mockApproval = {
        commissionId: '1',
        status: 'approved' as const,
        approvedBy: 'user1',
        notes: 'Approved',
      };

      const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        await result.current.approveCommission(mockApproval);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when approving commission', async () => {
      const mockError = new Error('Failed to approve commission');
      const mockUpdateDoc = jest.fn().mockRejectedValue(mockError);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        try {
          await result.current.approveCommission({} as any);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('recordPayment', () => {
    it('should record payment and update state', async () => {
      const mockPayment = {
        commissionId: '1',
        amount: 5000,
        paymentMethod: 'bank_transfer' as const,
        paidBy: 'user1',
        notes: 'Payment recorded',
      };

      const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        await result.current.recordPayment(mockPayment);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when recording payment', async () => {
      const mockError = new Error('Failed to record payment');
      const mockUpdateDoc = jest.fn().mockRejectedValue(mockError);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useCommissionStore());

      await act(async () => {
        try {
          await result.current.recordPayment({} as any);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });
});
