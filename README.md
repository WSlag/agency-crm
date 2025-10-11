# Agency CRM

A Progressive Web Application (PWA) for managing the end-to-end recruitment workflow of a multi-branch recruitment agency.

## Environment Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Firebase CLI

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
The application supports three environments:

1. **Development**
```bash
# Run development server
npm run dev
```

2. **Staging**
```bash
# Build staging
npm run build:staging

# Preview staging build
npm run preview:staging
```

3. **Production**
```bash
# Build production
npm run build:prod

# Preview production build
npm run preview:prod
```

### Environment Variables
Create the following environment files:

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Example structure:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Sentry Configuration
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ENVIRONMENT=development|staging|production

# App Configuration
VITE_APP_NAME=Agency CRM
VITE_APP_URL=http://localhost:3000
VITE_STORAGE_PREFIX=dev_|staging_|prod_
VITE_LOG_LEVEL=debug|info|error
```

## Security Guidelines

### Environment Security
- Never commit `.env` files to version control
- Store sensitive credentials in a secure password manager
- Use different Firebase projects for each environment
- Rotate API keys periodically

### Firebase Security
- Implement appropriate Firestore security rules
- Enable Firebase App Check in production
- Set up proper authentication methods
- Configure proper storage access rules

### Application Security
- Enable strict CSP in production
- Implement proper role-based access control
- Sanitize all user inputs
- Implement proper error handling

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure
- Unit tests: `src/tests/unit/`
- Integration tests: `src/tests/integration/`
- Environment tests: `src/tests/environment.test.ts`
- Firebase tests: `src/tests/firebase.test.ts`

## Project Structure
```
src/
├── components/     # React components
├── config/        # Configuration files
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── pages/         # Page components
├── services/      # Service layer
├── stores/        # State management
├── tests/         # Test files
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## Build and Deployment

### Build Commands
```bash
# Development build
npm run dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

### Deployment Checklist
- [ ] Run all tests
- [ ] Check environment variables
- [ ] Build for target environment
- [ ] Verify Firebase configuration
- [ ] Check Sentry integration
- [ ] Verify security rules
- [ ] Test offline functionality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build:staging` - Build staging version
- `npm run build:prod` - Build production version
- `npm run preview:staging` - Preview staging build
- `npm run preview:prod` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage
- `npm run lint` - Run linter
- `npm run type-check` - Run TypeScript checks

## Contributing

1. Create feature branch from `develop`
2. Make changes and add tests
3. Run tests and linting
4. Create pull request
5. Get code review
6. Merge to `develop`

## License

[MIT License](LICENSE)
