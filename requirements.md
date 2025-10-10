# Recruitment Agency PWA CRM – Requirements 
## 1. Overview
A **Progressive Web Application (PWA)** for managing the end-to-end recruitment workflow of a multi-branch recruitment agency.  
Built with **Firebase** for real-time synchronization, scalability, and simplified deployment.

### Objectives
- Digitize recruitment, transfer, and approval workflows
- Support offline and multi-device operation
- Track applicant progress, expenses, and commissions
- Enable controlled **Branch → Head Office transfer workflows**
- Provide real-time dashboards and analytics per role

---

## 2. Technical Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React.js + TypeScript |
| UI Framework | Material-UI / Tailwind CSS |
| State Management | Redux Toolkit / Zustand |
| Backend | **Firebase Cloud Functions (Node.js runtime)** |
| Database | **Cloud Firestore (NoSQL, real-time)** |
| Authentication | **Firebase Authentication (Email/Password, Role-based)** |
| File Storage | **Firebase Storage (for documents and receipts)** |
| Hosting | **Firebase Hosting (with HTTPS + CDN)** |
| Notifications | **Firebase Cloud Messaging (FCM)** |
| Offline Support | Firestore offline persistence + Service Workers |
| Architecture | Modular PWA with Firebase backend |
| CI/CD | GitHub Actions / Firebase CLI |

---

## 3. Core Modules

### 3.1 Users & Roles
- Managed via Firebase Authentication + Firestore `users` collection
- Roles:  
  `admin`, `president`, `ho_recruitment_officer`, `ho_accountant`, `branch_manager`
- Each user stores:
  - `uid`, `email`, `displayName`, `role`, `branchId`, `status`
- Role-based dashboards via client-side route guards

---

### 3.2 Branch Management
- Firestore collection: `branches`
- Fields: `branchName`, `address`, `isHeadOffice`, `status`
- Admin can create/update branches
- Linked to users and applicants

---

### 3.3 Agents Management
- Firestore collection: `agents`
- Fields: `agentName`, `contactInfo`, `branchId`, `commissionRate`, `status`
- Linked to applicants
- Commission and performance tracked per branch

---

### 3.4 Applicant Management
- Firestore collection: `applicants`
- Fields: `fullName`, `contactInfo`, `agentId`, `branchId`, `assignedOfficerId`, `currentStage`, `transferredToHO`, `transferDate`
- Multi-stage workflow: **Interview → Medical → Processing → Deployment → Deployed**
- Branch managers can request transfer to Head Office
- HO officers manage assigned applicants

---

### 3.5 Applicant Transfer Workflow
Workflow handled via Cloud Functions triggers:
- Triggered by adding a document in `transfers` collection
- Preserves original branch/agent information
- Transfers applicant subcollections (documents, expenses, etc.)
- Updates permissions and visibility

---

### 3.6 Pipeline Management
- Firestore subcollection: `applicants/{applicantId}/pipeline`
- Each stage: `enteredDate`, `completedDate`, `notes`, `status`
- Automated notifications for stage changes
- Offline updates sync via Firestore

---

### 3.7 Expense Management
- Firestore collection: `expenses`
- Expense entry per applicant or office
- Status workflow: `pending → verified → approved`
- Cloud Functions handle verification/approval logic
- Linked to `users`, `branches`, `applicants`

---

### 3.8 Commission Management
- Firestore collection: `commissions`
- Request → Verification → Approval → Paid
- Original branch/agent retained even after transfer
- Cloud Functions auto-calculate based on applicant stage completion
- Payment tracking and reporting

---

### 3.9 Reports & Dashboards
- Real-time reports via Firestore aggregations
- Exports (PDF, Excel) generated via Cloud Functions
- Role-specific dashboards:
  - **Branch Manager:** Applicants, Expenses, Commissions
  - **HO Officer:** Assigned applicants
  - **Accountant:** Pending expenses/commissions
  - **Admin/President:** Global metrics and transfer status

---

### 3.10 Document Management
- Files stored in Firebase Storage under `/documents/{applicantId}/`
- Metadata in Firestore `documents` collection
- Document verification (status, verifiedBy)
- Expiry and missing document alerts
- Digital signatures (via integrated 3rd-party API)
- Maintains continuity during transfers

---

### 3.11 Notifications & Communication
- **FCM push notifications** for:
  - Transfer approvals, officer assignments, stage changes
- **Email notifications** via Cloud Functions (SendGrid/Mailgun)
- **In-app messaging** (Firestore `messages` collection)
- Activity logs stored in `audit_logs` collection

---

## 4. Key Workflows

### 4.1 Expense Approval
- Verified and approved via Cloud Functions
- Real-time updates with FCM alerts

### 4.2 Commission Approval
- Approval workflow with timestamp audit
- Commissions linked to applicant deployment

### 4.3 Applicant Transfer
- Automated via `transfers` collection
- Transfers all linked data (documents, expenses)
- Preserves branch read-only view

### 4.4 Recruitment Pipeline
- Progress tracked via `pipeline` subcollection

---

## 5. Firestore Schema (Simplified)

/users
uid, role, branchId, status

/branches
branchId, branchName, isHeadOffice

/agents
agentId, branchId, commissionRate

/applicants
applicantId, branchId, agentId, assignedOfficerId, currentStage
/pipeline
/documents
/expenses

/transfers
transferId, applicantId, fromBranchId, toBranchId, status, reason, assignedOfficerId

/expenses
expenseId, branchId, applicantId, amount, type, status

/commissions
commissionId, agentId, applicantId, amount, status

/reports
reportId, type, parameters, fileUrl

/audit_logs
action, userId, timestamp, details


---

## 6. Security & Access Rules

### Firestore Rules
- Role-based access via custom claims
- Validation of ownership (branch or applicant-based)
- Restricted write access for sensitive collections (`commissions`, `transfers`)
- Historical read-only access post-transfer

### Authentication
- Firebase Auth (Email/Password, with 2FA optional)
- Admin SDK for managing roles
- Session tokens (auto-refresh)
- Password reset via Firebase Auth templates

---

## 7. Performance Requirements
- Firestore reads/writes optimized using batched writes
- Indexed queries for all list pages
- Cloud Function execution < 500ms average
- Client load time < 3s
- Firestore offline caching enabled
- CDN via Firebase Hosting

---

## 8. Backup & Recovery
- Firestore backup via **Firebase Scheduled Export**
- Storage backup using Google Cloud Storage lifecycle rules
- Backup retention: 30 days
- Recovery via Firebase CLI or automated script

---

## 9. API Endpoints (via Cloud Functions HTTPS)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/applicants/{id}/transfer` | Request transfer to HO |
| PATCH | `/api/transfers/{id}/approve` | Approve transfer |
| PATCH | `/api/transfers/{id}/assign-officer` | Assign HO officer |
| GET | `/api/applicants/assigned` | List applicants assigned to logged-in officer |
| GET | `/api/applicants/{id}/history` | Retrieve applicant transfer history |

---

## 10. Development Best Practices
- TypeScript strict mode
- Firebase Emulator Suite for local testing
- Firestore security tests
- ESLint + Prettier enforced
- Unit testing with Jest
- CI/CD pipeline via GitHub Actions + Firebase CLI
- Git branching via GitFlow
- Environment variables managed via `.env.local`

---

## 11. PWA Features
- Offline-ready (Firestore persistence + Service Worker caching)
- Background sync for unsent forms
- Push notifications (FCM)
- Installable via `manifest.json`
- Cached static assets via Firebase Hosting

---

## 12. Deployment
- Firebase Hosting with auto-SSL
- Cloud Functions deployment via GitHub Actions
- Versioned deployment environments:
  - `/dev`
  - `/staging`
  - `/production`
- Monitoring via Firebase Crashlytics & Performance
- Logs via Firebase Console + Google Cloud Logging

---

## 13. KPIs & Success Metrics
- Transfer approval turnaround time
- Officer workload balance
- Applicant processing time per stage
- Expense/commission approval times
- Real-time dashboard responsiveness
- System uptime (99.5%)
- User engagement and adoption rate

---

## 14. Risks & Mitigation

| Risk | Mitigation |
|------|-------------|
| Firestore read cost scaling | Optimize queries, pagination, caching |
| Role misconfigurations | Enforce custom claims updates via Admin SDK |
| File storage misuse | Validate MIME types and file size limits |
| Data corruption during transfer | Transaction-based Cloud Function |
| Limited offline writes | Queue offline writes and background sync |

---

## 15. Next Steps
1. Finalize Firestore schema & security rules  
2. Configure Firebase Auth roles with Admin SDK  
3. Implement Cloud Functions for:
   - Applicant transfer
   - Expense/commission approvals
   - Email and push notifications  
4. Integrate FCM and Service Workers  
5. Begin Phase 1: Infrastructure & Authentication Setup  
6. Deploy to Firebase Hosting (Staging)

---
