# Development Guide

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Firebase CLI
- Git

### Initial Setup
```bash
# Clone repository
git clone [repository-url]
cd agency-crm

# Install dependencies
npm install

# Set up environment files
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production
```

## Environment Configuration

### Development Environment
1. Create Firebase Development Project
2. Enable required services
3. Get configuration keys
4. Update `.env.development`

### Staging Environment
1. Create Firebase Staging Project
2. Mirror development configuration
3. Get configuration keys
4. Update `.env.staging`

### Production Environment
1. Create Firebase Production Project
2. Enable production security
3. Get configuration keys
4. Update `.env.production`

## Development Workflow

### Running the Application
```bash
# Start development server
npm run dev

# Build for staging
npm run build:staging

# Build for production
npm run build:prod
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality
```bash
# Run linter
npm run lint

# Run type checking
npm run type-check
```

## Project Structure

### Directory Layout
```
src/
├── components/     # Reusable components
│   ├── auth/      # Authentication components
│   ├── common/    # Common components
│   └── forms/     # Form components
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

### Key Files
- `src/config/environment.ts` - Environment configuration
- `src/config/firebase.ts` - Firebase configuration
- `src/stores/authStore.ts` - Authentication state
- `src/types/index.ts` - Common types

## Development Guidelines

### Code Style
- Use TypeScript for all files
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful comments

### Component Guidelines
- Use functional components
- Implement proper error boundaries
- Write unit tests
- Document props and functions

### State Management
- Use Zustand for global state
- Keep state minimal
- Document state structure
- Implement proper types

### Testing
- Write unit tests for components
- Write integration tests for workflows
- Maintain good test coverage
- Document test cases

## Firebase Integration

### Authentication
```typescript
// Example authentication setup
import { auth } from '../config/firebase';

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};
```

### Firestore
```typescript
// Example Firestore usage
import { firestore } from '../config/firebase';

export const getDocument = async (collection: string, id: string) => {
  try {
    const doc = await getDoc(doc(firestore, collection, id));
    return doc.data();
  } catch (error) {
    throw new Error('Failed to fetch document');
  }
};
```

### Storage
```typescript
// Example Storage usage
import { storage } from '../config/firebase';

export const uploadFile = async (file: File, path: string) => {
  try {
    const ref = ref(storage, path);
    await uploadBytes(ref, file);
    return await getDownloadURL(ref);
  } catch (error) {
    throw new Error('File upload failed');
  }
};
```

## Error Handling

### Error Boundaries
```typescript
// Example Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Example API error handling
const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    // Handle specific API errors
    return error.message;
  }
  return 'An unexpected error occurred';
};
```

## Performance Optimization

### Code Splitting
```typescript
// Example code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
```

### Memoization
```typescript
// Example memoization
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

## Deployment

### Staging Deployment
1. Run tests
2. Build staging version
3. Deploy to staging environment
4. Run smoke tests

### Production Deployment
1. Run all tests
2. Build production version
3. Deploy to production
4. Monitor for issues

## Troubleshooting

### Common Issues
1. Environment variables not loading
2. Firebase initialization fails
3. Type errors in development
4. Test failures

### Debug Tools
- Chrome DevTools
- React DevTools
- Firebase Console
- Sentry Dashboard

## Resources

### Documentation
- [React Documentation](https://reactjs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev/)
