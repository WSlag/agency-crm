import { renderHook, act } from '@testing-library/react-hooks';
import { useBackgroundSync } from '../../hooks/useBackgroundSync';
import { BackgroundSync } from '../../services/backgroundSync';

// Mock BackgroundSync
jest.mock('../../services/backgroundSync', () => ({
  getInstance: jest.fn().mockReturnValue({
    registerSyncEvent: jest.fn(),
    syncData: jest.fn(),
    retryFailedItems: jest.fn(),
    cleanupSyncQueue: jest.fn(),
    getSyncStatus: jest.fn(),
  }),
}));

describe('useBackgroundSync', () => {
  let sync: jest.Mocked<BackgroundSync>;

  beforeEach(() => {
    sync = BackgroundSync.getInstance() as jest.Mocked<BackgroundSync>;
    jest.clearAllMocks();

    // Mock service worker support
    Object.defineProperty(window, 'navigator', {
      value: {
        serviceWorker: {
          ready: Promise.resolve({}),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      },
      writable: true,
    });

    Object.defineProperty(window, 'SyncManager', {
      value: {},
      writable: true,
    });
  });

  it('should check background sync support', () => {
    const { result } = renderHook(() => useBackgroundSync());

    expect(result.current.isSupported).toBe(true);
  });

  it('should get initial sync status', async () => {
    const mockStatus = {
      pending: 2,
      failed: 1,
      completed: 3,
    };

    sync.getSyncStatus.mockResolvedValue(mockStatus);

    const { result, waitForNextUpdate } = renderHook(() => useBackgroundSync());

    await waitForNextUpdate();

    expect(sync.getSyncStatus).toHaveBeenCalled();
    expect(result.current.syncStatus).toEqual(mockStatus);
  });

  it('should register sync event', async () => {
    const { result } = renderHook(() => useBackgroundSync());

    await act(async () => {
      await result.current.registerSync('test-sync');
    });

    expect(sync.registerSyncEvent).toHaveBeenCalledWith('test-sync');
    expect(result.current.error).toBeNull();
  });

  it('should handle sync registration error', async () => {
    const mockError = new Error('Registration failed');
    sync.registerSyncEvent.mockRejectedValue(mockError);

    const { result } = renderHook(() => useBackgroundSync());

    await act(async () => {
      try {
        await result.current.registerSync('test-sync');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe(mockError.message);
  });

  it('should sync data', async () => {
    const mockStatus = {
      pending: 1,
      failed: 0,
      completed: 4,
    };

    sync.syncData.mockResolvedValue(undefined);
    sync.getSyncStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useBackgroundSync());

    await act(async () => {
      await result.current.syncData();
    });

    expect(sync.syncData).toHaveBeenCalled();
    expect(result.current.syncStatus).toEqual(mockStatus);
    expect(result.current.syncInProgress).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle sync error', async () => {
    const mockError = new Error('Sync failed');
    sync.syncData.mockRejectedValue(mockError);

    const { result } = renderHook(() => useBackgroundSync());

    await act(async () => {
      try {
        await result.current.syncData();
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.syncInProgress).toBe(false);
  });

  it('should retry failed items', async () => {
    const mockStatus = {
      pending: 2,
      failed: 0,
      completed: 3,
    };

    sync.retryFailedItems.mockResolvedValue(undefined);
    sync.getSyncStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useBackgroundSync());

    await act(async () => {
      await result.current.retryFailedItems();
    });

    expect(sync.retryFailedItems).toHaveBeenCalled();
    expect(result.current.syncStatus).toEqual(mockStatus);
    expect(result.current.error).toBeNull();
  });

  it('should cleanup sync queue', async () => {
    const mockStatus = {
      pending: 1,
      failed: 0,
      completed: 2,
    };

    sync.cleanupSyncQueue.mockResolvedValue(undefined);
    sync.getSyncStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useBackgroundSync());

    await act(async () => {
      await result.current.cleanupSyncQueue();
    });

    expect(sync.cleanupSyncQueue).toHaveBeenCalled();
    expect(result.current.syncStatus).toEqual(mockStatus);
    expect(result.current.error).toBeNull();
  });

  it('should handle service worker messages', async () => {
    const { result } = renderHook(() => useBackgroundSync());

    // Simulate sync complete message
    await act(async () => {
      const event = new MessageEvent('message', {
        data: { type: 'sync_complete' },
      });
      window.navigator.serviceWorker.dispatchEvent(event);
    });

    expect(result.current.syncInProgress).toBe(false);

    // Simulate sync error message
    await act(async () => {
      const event = new MessageEvent('message', {
        data: { type: 'sync_error', error: 'Sync failed' },
      });
      window.navigator.serviceWorker.dispatchEvent(event);
    });

    expect(result.current.error).toBe('Sync failed');
    expect(result.current.syncInProgress).toBe(false);
  });

  it('should update sync status periodically', async () => {
    jest.useFakeTimers();

    const mockStatus = {
      pending: 1,
      failed: 0,
      completed: 2,
    };

    sync.getSyncStatus.mockResolvedValue(mockStatus);

    const { result } = renderHook(() => useBackgroundSync());

    await act(async () => {
      jest.advanceTimersByTime(30000); // 30 seconds
    });

    expect(sync.getSyncStatus).toHaveBeenCalledTimes(2); // Initial + after 30s
    expect(result.current.syncStatus).toEqual(mockStatus);

    jest.useRealTimers();
  });

  it('should cleanup event listeners and intervals on unmount', () => {
    const { unmount } = renderHook(() => useBackgroundSync());

    const removeEventListenerSpy = jest.spyOn(
      window.navigator.serviceWorker,
      'removeEventListener'
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    );
  });
});
