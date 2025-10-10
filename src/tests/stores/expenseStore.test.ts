import { renderHook, act } from '@testing-library/react-hooks';
import { useExpenseStore } from '../../stores/expenseStore';
import { db, storage } from '../../config/firebase';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
  storage: {
    ref: jest.fn(),
  },
}));

describe('expenseStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchExpenses', () => {
    it('should fetch expenses and update state', async () => {
      const mockExpenses = [
        {
          id: '1',
          expenseType: 'travel',
          amount: 1000,
          status: 'pending',
        },
        {
          id: '2',
          expenseType: 'office',
          amount: 2000,
          status: 'approved',
        },
      ];

      const mockQuery = {
        docs: mockExpenses.map((expense) => ({
          id: expense.id,
          data: () => expense,
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

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        await result.current.fetchExpenses();
      });

      expect(result.current.expenses).toHaveLength(2);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when fetching expenses', async () => {
      const mockError = new Error('Failed to fetch expenses');
      const mockGetDocs = jest.fn().mockRejectedValue(mockError);
      const mockCollection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        await result.current.fetchExpenses();
      });

      expect(result.current.expenses).toHaveLength(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('createExpense', () => {
    it('should create a new expense and update state', async () => {
      const mockExpense = {
        expenseType: 'travel',
        amount: 1000,
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

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        await result.current.createExpense(mockExpense as any);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when creating expense', async () => {
      const mockError = new Error('Failed to create expense');
      const mockSetDoc = jest.fn().mockRejectedValue(mockError);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        try {
          await result.current.createExpense({} as any);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('uploadReceipt', () => {
    it('should upload receipt and update expense', async () => {
      const mockFile = new File([''], 'receipt.jpg');
      const mockDownloadURL = 'https://example.com/receipt.jpg';

      const mockUploadBytes = jest.fn().mockResolvedValue(undefined);
      const mockGetDownloadURL = jest.fn().mockResolvedValue(mockDownloadURL);
      const mockStorageRef = jest.fn().mockReturnValue({
        put: mockUploadBytes,
        getDownloadURL: mockGetDownloadURL,
      });

      (storage.ref as jest.Mock).mockImplementation(mockStorageRef);

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        const url = await result.current.uploadReceipt('1', mockFile);
        expect(url).toBe(mockDownloadURL);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when uploading receipt', async () => {
      const mockError = new Error('Failed to upload receipt');
      const mockFile = new File([''], 'receipt.jpg');

      const mockUploadBytes = jest.fn().mockRejectedValue(mockError);
      const mockStorageRef = jest.fn().mockReturnValue({
        put: mockUploadBytes,
      });

      (storage.ref as jest.Mock).mockImplementation(mockStorageRef);

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        try {
          await result.current.uploadReceipt('1', mockFile);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('verifyExpense', () => {
    it('should verify expense and update state', async () => {
      const mockVerification = {
        expenseId: '1',
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

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        await result.current.verifyExpense(mockVerification);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors when verifying expense', async () => {
      const mockError = new Error('Failed to verify expense');
      const mockUpdateDoc = jest.fn().mockRejectedValue(mockError);
      const mockDoc = jest.fn().mockReturnValue({});
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      (db.collection as jest.Mock).mockImplementation(mockCollection);

      const { result } = renderHook(() => useExpenseStore());

      await act(async () => {
        try {
          await result.current.verifyExpense({} as any);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError.message);
    });
  });
});
