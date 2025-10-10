import { BackgroundSync } from '../../services/backgroundSync';
import { OfflineStorage } from '../../services/offlineStorage';
import { db } from '../../config/firebase';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

// Mock OfflineStorage
jest.mock('../../services/offlineStorage', () => ({
  getInstance: jest.fn().mockReturnValue({
    getPendingSyncItems: jest.fn(),
    deleteSyncItem: jest.fn(),
    updateSyncItem: jest.fn(),
    query: jest.fn(),
  }),
}));

describe('BackgroundSync', () => {
  let sync: BackgroundSync;
  let storage: jest.Mocked<OfflineStorage>;

  beforeEach(() => {
    sync = BackgroundSync.getInstance();
    storage = OfflineStorage.getInstance() as jest.Mocked<OfflineStorage>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerSyncEvent', () => {
    it('should register sync event when supported', async () => {
      const mockRegister = jest.fn();
      const mockSync = { register: mockRegister };
      const mockServiceWorker = {
        ready: Promise.resolve({ sync: mockSync }),
      };

      Object.defineProperty(navigator, 'serviceWorker', {
        value: mockServiceWorker,
        writable: true,
      });

      await sync.registerSyncEvent('test-sync');

      expect(mockRegister).toHaveBeenCalledWith('test-sync');
    });

    it('should handle unsupported sync', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      });

      const consoleSpy = jest.spyOn(console, 'warn');
      await sync.registerSyncEvent('test-sync');

      expect(consoleSpy).toHaveBeenCalledWith('Background sync not supported');
    });
  });

  describe('syncData', () => {
    it('should process pending sync items', async () => {
      const mockItems = [
        {
          id: '1',
          type: 'expenses',
          data: { id: '1', amount: 100 },
          operation: 'create',
        },
        {
          id: '2',
          type: 'commissions',
          data: { id: '2', amount: 200 },
          operation: 'update',
        },
      ];

      storage.getPendingSyncItems.mockResolvedValue(mockItems);

      await sync.syncData();

      expect(storage.getPendingSyncItems).toHaveBeenCalled();
      expect(storage.deleteSyncItem).toHaveBeenCalledTimes(2);
    });

    it('should handle sync errors', async () => {
      const mockItems = [
        {
          id: '1',
          type: 'expenses',
          data: { id: '1', amount: 100 },
          operation: 'create',
        },
      ];

      storage.getPendingSyncItems.mockResolvedValue(mockItems);
      storage.deleteSyncItem.mockRejectedValue(new Error('Sync failed'));

      await sync.syncData();

      expect(storage.updateSyncItem).toHaveBeenCalledWith('1', 'failed');
    });

    it('should not start sync if already in progress', async () => {
      // Start first sync
      const firstSync = sync.syncData();

      // Try to start second sync
      const secondSync = sync.syncData();

      await Promise.all([firstSync, secondSync]);

      expect(storage.getPendingSyncItems).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryFailedItems', () => {
    it('should retry failed items with less than 3 attempts', async () => {
      const mockFailedItems = [
        { id: '1', attempts: 1 },
        { id: '2', attempts: 2 },
        { id: '3', attempts: 3 },
      ];

      storage.query.mockResolvedValue(mockFailedItems);

      await sync.retryFailedItems();

      expect(storage.updateSyncItem).toHaveBeenCalledTimes(2);
      expect(storage.updateSyncItem).toHaveBeenCalledWith('1', 'pending');
      expect(storage.updateSyncItem).toHaveBeenCalledWith('2', 'pending');
    });
  });

  describe('cleanupSyncQueue', () => {
    it('should remove old successful items and failed items with too many attempts', async () => {
      const mockFailedItems = [
        { id: '1', attempts: 3 },
        { id: '2', attempts: 4 },
      ];

      const mockSuccessfulItems = [
        {
          id: '3',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days old
        },
        {
          id: '4',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days old
        },
      ];

      storage.query
        .mockResolvedValueOnce(mockFailedItems)
        .mockResolvedValueOnce(mockSuccessfulItems);

      await sync.cleanupSyncQueue();

      expect(storage.deleteSyncItem).toHaveBeenCalledTimes(3);
      expect(storage.deleteSyncItem).toHaveBeenCalledWith('1');
      expect(storage.deleteSyncItem).toHaveBeenCalledWith('2');
      expect(storage.deleteSyncItem).toHaveBeenCalledWith('3');
    });
  });

  describe('getSyncStatus', () => {
    it('should return correct sync status counts', async () => {
      storage.query
        .mockResolvedValueOnce([1, 2]) // pending
        .mockResolvedValueOnce([1]) // failed
        .mockResolvedValueOnce([1, 2, 3]); // completed

      const status = await sync.getSyncStatus();

      expect(status).toEqual({
        pending: 2,
        failed: 1,
        completed: 3,
      });
    });

    it('should handle errors when getting status', async () => {
      storage.query.mockRejectedValue(new Error('Failed to get status'));

      await expect(sync.getSyncStatus()).rejects.toThrow('Failed to get status');
    });
  });
});
