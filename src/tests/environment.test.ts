import { environment, isProduction, isStaging, isDevelopment } from '../config/environment';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: 'test-app-id',
      VITE_SENTRY_DSN: 'test-sentry-dsn',
      VITE_SENTRY_ENVIRONMENT: 'test',
      VITE_APP_NAME: 'Test App',
      VITE_APP_URL: 'http://localhost:3000',
      VITE_STORAGE_PREFIX: 'test_',
      VITE_LOG_LEVEL: 'debug',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('loads firebase configuration', () => {
    expect(environment.firebase.apiKey).toBeDefined();
    expect(environment.firebase.authDomain).toBeDefined();
    expect(environment.firebase.projectId).toBeDefined();
    expect(environment.firebase.storageBucket).toBeDefined();
    expect(environment.firebase.messagingSenderId).toBeDefined();
    expect(environment.firebase.appId).toBeDefined();
  });

  test('loads sentry configuration', () => {
    expect(environment.sentry.dsn).toBeDefined();
    expect(environment.sentry.environment).toBeDefined();
    expect(environment.sentry.tracesSampleRate).toBeDefined();
  });

  test('loads app configuration', () => {
    expect(environment.app.name).toBeDefined();
    expect(environment.app.apiUrl).toBeDefined();
    expect(environment.app.storagePrefix).toBeDefined();
    expect(environment.app.logLevel).toBeDefined();
  });

  test('environment flags are mutually exclusive', () => {
    const envFlags = [isProduction, isStaging, isDevelopment];
    const trueFlags = envFlags.filter(flag => flag === true);
    expect(trueFlags.length).toBeLessThanOrEqual(1);
  });

  test('validates required environment variables', () => {
    delete process.env.VITE_FIREBASE_API_KEY;
    expect(() => {
      jest.resetModules();
      require('../config/environment');
    }).toThrow('Missing required environment variable: VITE_FIREBASE_API_KEY');
  });
});