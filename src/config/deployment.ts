export interface EnvironmentConfig {
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
  monitoring: {
    errorReporting: boolean;
    performanceMonitoring: boolean;
    analyticsEnabled: boolean;
  };
  backup: {
    schedule: 'daily' | 'weekly';
    retention: number; // days
    includeFiles: boolean;
  };
}

export interface DeploymentConfig {
  environments: {
    development: EnvironmentConfig;
    staging: EnvironmentConfig;
    production: EnvironmentConfig;
  };
  features: {
    offline: boolean;
    pushNotifications: boolean;
    backgroundSync: boolean;
    analytics: boolean;
  };
  security: {
    contentSecurityPolicy: boolean;
    strictTransportSecurity: boolean;
    xssProtection: boolean;
  };
}

const config: DeploymentConfig = {
  environments: {
    development: {
      firebase: {
        apiKey: process.env.REACT_APP_DEV_FIREBASE_API_KEY!,
        authDomain: process.env.REACT_APP_DEV_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.REACT_APP_DEV_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.REACT_APP_DEV_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.REACT_APP_DEV_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.REACT_APP_DEV_FIREBASE_APP_ID!,
      },
      sentry: {
        dsn: process.env.REACT_APP_DEV_SENTRY_DSN!,
        environment: 'development',
        tracesSampleRate: 1.0,
      },
      monitoring: {
        errorReporting: true,
        performanceMonitoring: true,
        analyticsEnabled: false,
      },
      backup: {
        schedule: 'daily',
        retention: 7,
        includeFiles: true,
      },
    },
    staging: {
      firebase: {
        apiKey: process.env.REACT_APP_STAGING_FIREBASE_API_KEY!,
        authDomain: process.env.REACT_APP_STAGING_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.REACT_APP_STAGING_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.REACT_APP_STAGING_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.REACT_APP_STAGING_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.REACT_APP_STAGING_FIREBASE_APP_ID!,
        measurementId: process.env.REACT_APP_STAGING_FIREBASE_MEASUREMENT_ID,
      },
      sentry: {
        dsn: process.env.REACT_APP_STAGING_SENTRY_DSN!,
        environment: 'staging',
        tracesSampleRate: 0.5,
      },
      monitoring: {
        errorReporting: true,
        performanceMonitoring: true,
        analyticsEnabled: true,
      },
      backup: {
        schedule: 'daily',
        retention: 14,
        includeFiles: true,
      },
    },
    production: {
      firebase: {
        apiKey: process.env.REACT_APP_PROD_FIREBASE_API_KEY!,
        authDomain: process.env.REACT_APP_PROD_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.REACT_APP_PROD_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.REACT_APP_PROD_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.REACT_APP_PROD_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.REACT_APP_PROD_FIREBASE_APP_ID!,
        measurementId: process.env.REACT_APP_PROD_FIREBASE_MEASUREMENT_ID,
      },
      sentry: {
        dsn: process.env.REACT_APP_PROD_SENTRY_DSN!,
        environment: 'production',
        tracesSampleRate: 0.1,
      },
      monitoring: {
        errorReporting: true,
        performanceMonitoring: true,
        analyticsEnabled: true,
      },
      backup: {
        schedule: 'daily',
        retention: 30,
        includeFiles: true,
      },
    },
  },
  features: {
    offline: true,
    pushNotifications: true,
    backgroundSync: true,
    analytics: true,
  },
  security: {
    contentSecurityPolicy: true,
    strictTransportSecurity: true,
    xssProtection: true,
  },
};

export const getConfig = (environment: keyof DeploymentConfig['environments']): EnvironmentConfig => {
  return config.environments[environment];
};

export const isFeatureEnabled = (feature: keyof DeploymentConfig['features']): boolean => {
  return config.features[feature];
};

export const getSecurityConfig = (): DeploymentConfig['security'] => {
  return config.security;
};
