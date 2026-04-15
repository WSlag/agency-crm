# 🏢 Agency CRM Platform

## 🚀 Production-Ready Recruitment System

A Progressive Web Application (PWA) designed to manage the **end-to-end recruitment workflow** for multi-branch recruitment agencies.

Built to digitize and streamline operations such as applicant tracking, deployment processing, and financial tracking across branches.

---

## 🧠 Business Context

Recruitment agencies often rely on:
- Manual tracking (Excel, paper, chat)
- Disconnected branch operations
- Lack of real-time visibility

👉 This system solves these by providing a **centralized digital workflow platform**.

---

## 💡 Key Features

- 🧾 Applicant Lifecycle Management (Lead → Deployment)
- 🏢 Multi-Branch Workflow System
- 💰 Expense & Fund Request Tracking
- 📊 Admin Dashboard & Reporting
- 🔐 Role-Based Access Control
- 📱 Mobile-First Progressive Web App (PWA)

---

## ⚙️ Tech Stack

### Frontend
- React + Vite
- Tailwind CSS

### Backend
- Firebase (Firestore, Auth, Cloud Functions)

### Architecture
- Real-time database (Firestore)
- Cloud-based serverless backend
- PWA for mobile accessibility

---

## 🏗 System Capabilities

This platform demonstrates:

- CRM system architecture design  
- Workflow automation for recruitment agencies  
- Role-based system design  
- Real-time data synchronization  
- Multi-branch business logic implementation  

---

## 💼 Use Case

Ideal for:
- Recruitment agencies
- HR outsourcing firms
- Multi-branch operations
- Manpower deployment companies

---

## ⚙️ Environment Setup

### Prerequisites
- Node.js (v16+)
- npm (v7+)
- Firebase CLI

---

### Development
```bash
npm install
npm run dev

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

## License

[MIT License](LICENSE)
