import { OfflineStorage } from '../../services/offlineStorage';

describe('OfflineStorage', () => {
  let storage: OfflineStorage;

  beforeEach(async () => {
    storage = OfflineStorage.getInstance();
    await storage.init();
  });

  afterEach(async () => {
    // Clear all stores
    const stores = [
      'expenses',
      'commissions',
      'applicants',
      'documents',
      'notifications',
      'sync_queue',
    ];
    await Promise.all(stores.map((store) => storage.clear(store)));
  });

  describe('CRUD operations', () => {
    it('should add and retrieve an item', async () => {
      const testItem = {
        id: '1',
        name: 'Test Item',
        value: 100,
      };

      await storage.add('expenses', testItem);
      const retrievedItem = await storage.get('expenses', '1');

      expect(retrievedItem).toEqual(testItem);
    });

    it('should update an item', async () => {
      const testItem = {
        id: '1',
        name: 'Test Item',
        value: 100,
      };

      await storage.add('expenses', testItem);

      const updatedItem = {
        ...testItem,
        value: 200,
      };

      await storage.update('expenses', updatedItem);
      const retrievedItem = await storage.get('expenses', '1');

      expect(retrievedItem).toEqual(updatedItem);
    });

    it('should delete an item', async () => {
      const testItem = {
        id: '1',
        name: 'Test Item',
        value: 100,
      };

      await storage.add('expenses', testItem);
      await storage.delete('expenses', '1');
      const retrievedItem = await storage.get('expenses', '1');

      expect(retrievedItem).toBeNull();
    });

    it('should get all items', async () => {
      const testItems = [
        { id: '1', name: 'Item 1', value: 100 },
        { id: '2', name: 'Item 2', value: 200 },
        { id: '3', name: 'Item 3', value: 300 },
      ];

      await Promise.all(testItems.map((item) => storage.add('expenses', item)));
      const allItems = await storage.getAll('expenses');

      expect(allItems).toHaveLength(3);
      expect(allItems).toEqual(expect.arrayContaining(testItems));
    });

    it('should clear all items', async () => {
      const testItems = [
        { id: '1', name: 'Item 1', value: 100 },
        { id: '2', name: 'Item 2', value: 200 },
      ];

      await Promise.all(testItems.map((item) => storage.add('expenses', item)));
      await storage.clear('expenses');
      const allItems = await storage.getAll('expenses');

      expect(allItems).toHaveLength(0);
    });
  });

  describe('Query operations', () => {
    it('should query items by index', async () => {
      const testItems = [
        { id: '1', status: 'pending', value: 100 },
        { id: '2', status: 'approved', value: 200 },
        { id: '3', status: 'pending', value: 300 },
      ];

      await Promise.all(testItems.map((item) => storage.add('expenses', item)));
      const pendingItems = await storage.query('expenses', 'status', 'pending');

      expect(pendingItems).toHaveLength(2);
      expect(pendingItems).toEqual(
        expect.arrayContaining([testItems[0], testItems[2]])
      );
    });
  });

  describe('Sync queue operations', () => {
    it('should add item to sync queue', async () => {
      const testItem = {
        id: '1',
        name: 'Test Item',
        value: 100,
      };

      await storage.addToSyncQueue('expenses', testItem, 'create');
      const pendingItems = await storage.getPendingSyncItems();

      expect(pendingItems).toHaveLength(1);
      expect(pendingItems[0]).toMatchObject({
        type: 'expenses',
        data: testItem,
        operation: 'create',
        status: 'pending',
      });
    });

    it('should update sync item status', async () => {
      const testItem = {
        id: '1',
        name: 'Test Item',
        value: 100,
      };

      await storage.addToSyncQueue('expenses', testItem, 'create');
      const pendingItems = await storage.getPendingSyncItems();
      const syncItemId = pendingItems[0].id;

      await storage.updateSyncItem(syncItemId, 'completed');
      const updatedItem = await storage.get('sync_queue', syncItemId);

      expect(updatedItem).toMatchObject({
        status: 'completed',
        attempts: 1,
      });
    });

    it('should delete sync item', async () => {
      const testItem = {
        id: '1',
        name: 'Test Item',
        value: 100,
      };

      await storage.addToSyncQueue('expenses', testItem, 'create');
      const pendingItems = await storage.getPendingSyncItems();
      const syncItemId = pendingItems[0].id;

      await storage.deleteSyncItem(syncItemId);
      const deletedItem = await storage.get('sync_queue', syncItemId);

      expect(deletedItem).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw error when database is not initialized', async () => {
      const uninitializedStorage = OfflineStorage.getInstance();
      await expect(uninitializedStorage.add('expenses', {})).rejects.toThrow(
        'Database not initialized'
      );
    });

    it('should handle invalid store name', async () => {
      await expect(
        storage.add('invalid_store', { id: '1' })
      ).rejects.toThrow();
    });

    it('should handle invalid data format', async () => {
      await expect(
        storage.add('expenses', { invalid: 'data' } as any)
      ).rejects.toThrow();
    });
  });
});
