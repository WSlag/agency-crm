import { app, auth, firestore, storage, analytics } from '../config/firebase';
import { isProduction } from '../config/environment';

describe('Firebase Configuration', () => {
  test('initializes Firebase app', () => {
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
  });

  test('initializes Firebase services', () => {
    expect(auth).toBeDefined();
    expect(firestore).toBeDefined();
    expect(storage).toBeDefined();
  });

  test('initializes analytics only in production', () => {
    if (isProduction) {
      expect(analytics).toBeDefined();
    } else {
      expect(analytics).toBeNull();
    }
  });

  test('Firebase app has correct config', () => {
    const config = app.options;
    expect(config.apiKey).toBeDefined();
    expect(config.authDomain).toBeDefined();
    expect(config.projectId).toBeDefined();
    expect(config.storageBucket).toBeDefined();
    expect(config.messagingSenderId).toBeDefined();
    expect(config.appId).toBeDefined();
  });

  test('Firebase services are properly configured', () => {
    // Test Firestore configuration
    expect(firestore).toHaveProperty('type', 'firestore');
    
    // Test Storage configuration
    expect(storage).toHaveProperty('type', 'storage');
    
    // Test Auth configuration
    expect(auth).toHaveProperty('type', 'auth');
  });
});
