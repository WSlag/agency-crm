# Offline Capabilities

## Overview
The application supports offline functionality through service workers, IndexedDB storage, and background sync. This guide explains how to use and implement offline features.

## Features

### Offline Storage
Data is stored locally using IndexedDB with the following stores:
- `sync_queue`: Pending sync operations
- `templates`: Document templates
- `notifications`: User notifications
- `documents`: Document data

### Background Sync
Service worker handles data synchronization when online:
- Automatic sync on connection restore
- Manual sync trigger
- Retry mechanism for failed operations

### Conflict Resolution
Strategy for handling conflicts between local and server data:
1. Last-write-wins for simple data
2. Merge strategy for complex objects
3. User prompt for critical conflicts

## Implementation

### Using Offline Hook
```typescript
import { useOffline } from '@/hooks/useOffline';

function MyComponent() {
  const {
    isOnline,
    isInitialized,
    syncStatus,
    error,
    saveOffline,
    getOfflineData,
    syncData,
    retryFailedSync
  } = useOffline();

  // Save data offline
  const handleSave = async (data) => {
    try {
      await saveOffline('collection', data);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Get offline data
  const loadData = async () => {
    try {
      const data = await getOfflineData('collection');
      // Process data
    } catch (error) {
      console.error('Failed to load:', error);
    }
  };
}
```

### Offline Service
```typescript
import { offlineService } from '@/services/OfflineService';

// Initialize service
await offlineService.init();

// Add to sync queue
await offlineService.addToSyncQueue({
  operation: 'create',
  collection: 'documents',
  data: documentData
});

// Process sync queue
await offlineService.processSyncQueue();

// Get sync status
const status = await offlineService.getSyncStatus();
```

### Service Worker
```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// Handle sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
```

## Components

### OfflineIndicator
Visual indicator for offline status and sync operations:
```tsx
import { OfflineIndicator } from '@/components/offline/OfflineIndicator';

<OfflineIndicator />
```

Features:
- Online/offline status
- Sync progress
- Error display
- Manual sync trigger

## Best Practices

### Data Storage
1. Use appropriate storage method:
   - IndexedDB for structured data
   - Cache API for assets
   - LocalStorage for small config

2. Implement storage limits:
   - Monitor storage usage
   - Clean up old data
   - Prioritize critical data

### Sync Strategy
1. Queue Management:
   - Prioritize operations
   - Handle dependencies
   - Implement retry logic

2. Error Handling:
   - Log sync failures
   - Provide user feedback
   - Support manual retry

### User Experience
1. Status Indication:
   - Clear offline status
   - Sync progress
   - Error messages

2. Data Access:
   - Read from local first
   - Background sync
   - Conflict resolution UI

## Testing

### Unit Tests
```typescript
describe('OfflineService', () => {
  it('saves data offline', async () => {
    const data = { id: '1', content: 'test' };
    await offlineService.saveOffline('collection', data);
    const saved = await offlineService.getOffline('collection', '1');
    expect(saved).toEqual(data);
  });
});
```

### Integration Tests
```typescript
describe('Offline Integration', () => {
  it('syncs data when online', async () => {
    // Set up offline data
    await offlineService.saveOffline('collection', data);
    
    // Simulate online
    await goOnline();
    
    // Verify sync
    const synced = await getServerData('collection');
    expect(synced).toEqual(data);
  });
});
```

## Troubleshooting

### Common Issues
1. Sync Failures
   - Check network connectivity
   - Verify data integrity
   - Check storage limits

2. Storage Errors
   - Clear browser data
   - Check quota usage
   - Verify IndexedDB support

3. Service Worker
   - Update registration
   - Clear cache
   - Check browser support

### Debug Tools
1. Browser DevTools
   - Application tab
   - Network conditions
   - IndexedDB browser

2. Logging
   - Sync operations
   - Error details
   - Storage usage
