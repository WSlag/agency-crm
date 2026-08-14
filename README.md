# 🏢 Agency CRM

> A production-ready recruitment agency management platform that digitizes the end-to-end recruitment workflow across multiple branches — from lead and applicant tracking, to approvals, commissions, expenses, and reporting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-4-purple)
![Firebase](https://img.shields.io/badge/Firebase-9-orange)
![PWA](https://img.shields.io/badge/PWA-ready-green)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Role-Based Access](#-role-based-access)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Documentation](#-documentation)
- [License](#-license)

---

## 🧠 Overview

Recruitment agencies often rely on manual processes — spreadsheets, paper, and scattered chat threads — which makes it difficult to track applicants, coordinate branches, and see what's happening in real time.

**Agency CRM** replaces that with a centralized digital workflow platform:

- **Applicant lifecycle management** from lead to deployment
- **Multi-branch operations** with branch-level isolation and targets
- **Role-based access control** across every workflow stage
- **Financial tracking** for commissions and expenses
- **Mobile-first PWA** so field staff can work from any device

---

## ✨ Key Features

| Area | Capabilities |
| --- | --- |
| 🧾 **Applicant Management** | Full lifecycle (Lead → Deployment), stage approvals, document verification, transfers with history, resume approval, filters and search |
| 🏢 **Multi-Branch Workflow** | Branch manager dashboards, branch targets, HQ oversight, role-scoped applicant access |
| 💰 **Commissions** | Request → verify → approve → pay workflow, partial payments, commission splits, per-agent tracking |
| 🧾 **Expenses** | Expense requests, receipt upload, verification & approval flow, record payments |
| 📊 **Reporting** | Dashboard metrics, report builder, per-role dashboards (Admin, President, HQ Officer, HQ Accountant, Branch Manager) |
| 🔐 **Security** | Firestore security rules, custom claims (roles), environment-based config, PWA offline support |
| 📱 **PWA** | Installable, offline-capable, mobile-responsive UI |

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS |
| **UI/UX** | Headless UI · Heroicons · Lucide · Framer Motion · Nivo charts |
| **Forms/Validation** | React Hook Form · Zod |
| **State** | Zustand |
| **Backend** | Firebase — Firestore, Authentication, Cloud Functions, Storage, FCM |
| **Data Export** | xlsx |
| **Quality** | Jest · ESLint · Cypress · Vitest |

---

## 👥 Role-Based Access

| Role | Scope |
| --- | --- |
| **Admin** | Full access across all branches and modules |
| **President** | Agency-wide oversight, approvals, reporting |
| **HQ Recruitment Officer** | Applicant management, assignments, stage approvals |
| **HQ Accountant** | Financial workflows — commissions and expenses |
| **Branch Manager** | Branch-scoped applicants, targets, and dashboards |

Access is enforced server-side through Firebase custom claims and Firestore security rules, in addition to UI-level routing guards.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [npm](https://www.npmjs.com/) v7+
- [Firebase CLI](https://firebase.google.com/docs/cli)
- A [Firebase](https://firebase.google.com/) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/WSlag/agency-crm.git
cd agency-crm

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.development
# Then fill in your Firebase credentials (see Firebase Console > Project Settings)
```

### Run locally

```bash
npm run dev
```

The app starts at `http://localhost:5173` (see `vite.config.ts` for the configured port).

> ⚠️ **Note:** This application requires a configured Firebase project (Auth, Firestore, Storage) to function. The repository never contains real credentials — see [.env.example](.env.example).

---

## 📜 Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build:staging` | Type-check and build for staging |
| `npm run build:prod` | Type-check and build for production |
| `npm test` | Run unit tests (Jest) |
| `npm run lint` | Lint the source (`eslint`) |
| `npm run type-check` | Type-check with `tsc --noEmit` |
| `npm run init-db` | Initialize the database with sample data |

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full development workflow.

---

## 📁 Project Structure

```
agency-crm/
├── src/
│   ├── components/   # Reusable UI components
│   ├── config/       # Environment & Firebase configuration
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom hooks
│   ├── pages/        # Route-level page components
│   ├── schemas/      # Zod validation schemas
│   ├── scripts/      # Database & maintenance scripts
│   ├── services/     # Service layer (Firebase, notifications, etc.)
│   ├── stores/       # Zustand global state
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── functions/        # Firebase Cloud Functions
├── docs/             # Documentation & archived change reports
├── cypress/          # End-to-end tests
├── firestore.rules   # Firestore security rules
├── storage.rules     # Cloud Storage security rules
└── public/           # PWA assets
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

- Unit tests live in `src/tests/`
- End-to-end tests live in `cypress/`

---

## ☁️ Deployment

Firebase Hosting is used for web deployment:

```bash
# Deploy the frontend
firebase deploy --only hosting

# Deploy security rules
npm run migrate:rules

# Deploy Cloud Functions
npm run deploy:functions
```

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🔒 Security

- **Never commit secrets** — credentials live in gitignored `.env.*` files
- Firestore and Storage access is governed by `firestore.rules` and `storage.rules`
- Role-based authorization via Firebase custom claims
- Report security issues privately — see [SECURITY.md](SECURITY.md)

---

## 📚 Documentation

| Document | Description |
| --- | --- |
| [requirements.md](requirements.md) | Functional requirements and feature scope |
| [implementationPlan.md](implementationPlan.md) | Implementation roadmap |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Developer setup and workflow |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Deployment instructions |
| [SECURITY.md](SECURITY.md) | Security policy |

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).