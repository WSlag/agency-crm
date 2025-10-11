interface Environment {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  sentry: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
  };
  app: {
    name: string;
    apiUrl: string;
    storagePrefix: string;
    logLevel: 'debug' | 'info' | 'error';
  };
}

// Environment validation
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_SENTRY_DSN',
  'VITE_APP_NAME',
  'VITE_APP_URL',
  'VITE_STORAGE_PREFIX',
  'VITE_LOG_LEVEL'
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const environment: Environment = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    apiUrl: import.meta.env.VITE_APP_URL,
    storagePrefix: import.meta.env.VITE_STORAGE_PREFIX,
    logLevel: (import.meta.env.VITE_LOG_LEVEL || 'error') as 'debug' | 'info' | 'error',
  },
};

// Environment mode helpers
export const isProduction = import.meta.env.MODE === 'production';
export const isStaging = import.meta.env.MODE === 'staging';
export const isDevelopment = import.meta.env.MODE === 'development';

// Helper functions
export const getStorageKey = (key: string): string => {
  return `${environment.app.storagePrefix}${key}`;
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = environment.app.apiUrl.endsWith('/')
    ? environment.app.apiUrl.slice(0, -1)
    : environment.app.apiUrl;
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint.slice(1)
    : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Logger configuration
export const logger = {
  debug: (...args: any[]) => {
    if (environment.app.logLevel === 'debug') {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(environment.app.logLevel)) {
      console.info('[INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};