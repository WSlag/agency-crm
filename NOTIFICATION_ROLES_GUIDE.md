# 👥 Notification System - Role-Based Access Guide

## Overview

This guide explains what notifications each user role receives and what actions they can perform.

---

## 🔐 Access Matrix

| Feature | Admin | President | HO Officer | HO Accountant | Branch Manager |
|---------|-------|-----------|------------|---------------|----------------|
| **View Own Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View All Notifications** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mark as Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Archive Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Delete Own Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Delete Any Notifications** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Access Notifications Page** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Configure Preferences** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📬 Notification Types by Role

### 🔴 ADMIN
**Receives ALL system notifications:**
- ✅ All transfer requests and approvals
- ✅ All expense approvals and rejections
- ✅ All commission approvals
- ✅ All document verifications
- ✅ User management notifications
- ✅ System alerts
- ✅ Security notifications
- ✅ Branch performance alerts
- ✅ All applicant stage changes

**Use Cases:**
- System monitoring
- User management
- Security oversight
- Full system visibility

---

### 🟠 PRESIDENT
**Receives high-level business notifications:**

#### Transfer Notifications:
- ✅ `transfer_request` - When branch managers request transfers
- ✅ `transfer_approved` - When HO approves transfers (FYI)
- ✅ `transfer_rejected` - When transfers are rejected

#### Financial Notifications:
- ✅ `expense_approved` - High-value expense approvals
- ✅ `expense_rejected` - Expense rejections (for review)
- ✅ `commission_approved` - All commission approvals
- ✅ `commission_verified` - Commission verifications

#### Operational Notifications:
- ✅ `stage_change` - Important applicant stage changes
- ✅ `document_expiring` - Critical document expiry alerts
- ⚠️ High-priority system alerts only

**Use Cases:**
- Executive oversight
- High-value approvals
- Strategic decision-making
- Performance monitoring

---

### 🟢 HO RECRUITMENT OFFICER
**Receives applicant-related notifications:**

#### Applicant Management:
- ✅ `officer_assigned` - When assigned to new applicant
- ✅ `stage_change` - Applicant progress updates
- ✅ `document_verified` - Document verification results
- ✅ `document_rejected` - Document issues
- ✅ `document_expiring` - Document expiry alerts

#### Transfer Notifications:
- ✅ `transfer_request` - Transfer requests for assigned applicants
- ✅ `transfer_approved` - Transfer approvals
- ✅ `transfer_rejected` - Transfer rejections

#### Task Notifications:
- ✅ `task_assigned` - New tasks assigned
- ✅ `message_received` - Internal messages

**Use Cases:**
- Applicant processing
- Document management
- Stage transitions
- Task management

---

### 🟡 HO ACCOUNTANT
**Receives financial notifications:**

#### Expense Notifications:
- ✅ `expense_verified` - When expenses need verification
- ✅ `expense_approved` - Expense approvals (for tracking)
- ✅ `expense_rejected` - Rejected expenses

#### Commission Notifications:
- ✅ `commission_verified` - When commissions need verification
- ✅ `commission_approved` - Commission approvals
- ✅ `commission_rejected` - Rejected commissions

#### Financial Alerts:
- ⚠️ Budget threshold alerts
- ⚠️ Payment due notifications
- ⚠️ Financial document expiry

**Use Cases:**
- Financial verification
- Budget monitoring
- Payment processing
- Financial reporting

---

### 🔵 BRANCH MANAGER
**Receives branch-specific notifications:**

#### Applicant Notifications (Branch Only):
- ✅ `stage_change` - For branch applicants
- ✅ `document_verified` - Branch applicant documents
- ✅ `document_rejected` - Document issues
- ✅ `document_expiring` - Document expiry (branch applicants)

#### Transfer Notifications (Branch Only):
- ✅ `transfer_request` - Transfer requests initiated by them
- ✅ `transfer_approved` - When their transfers are approved
- ✅ `transfer_rejected` - When their transfers are rejected

#### Financial Notifications (Branch Level):
- ✅ `expense_verified` - Branch expense verifications
- ✅ `expense_approved` - Branch expense approvals
- ✅ `commission_verified` - Branch agent commissions
- ✅ `commission_approved` - Branch commission approvals

#### Branch Operations:
- ⚠️ Branch-level alerts
- ⚠️ Agent performance updates
- ⚠️ Branch budget alerts

**Use Cases:**
- Branch operations
- Local applicant management
- Branch expense management
- Agent supervision

---

## 🎯 Notification Flow Examples

### Example 1: Transfer Request
```
1. Branch Manager (Cotabato) requests transfer
   └── Notification sent to: President, HO Officers

2. President approves transfer
   └── Notification sent to: Branch Manager (requester), HO Officer (assigned)

3. HO Officer processes transfer
   └── Notification sent to: Branch Manager, President (FYI)
```

### Example 2: Expense Approval
```
1. Branch Manager submits expense
   └── Notification sent to: HO Accountant

2. HO Accountant verifies expense
   └── Notification sent to: President (if high value), Branch Manager

3. President approves expense
   └── Notification sent to: Branch Manager, HO Accountant, Admin
```

### Example 3: Document Expiring
```
1. System detects expiring document (30 days)
   └── Notification sent to: HO Officer (assigned), Branch Manager

2. System alerts again (7 days)
   └── Notification sent to: HO Officer, Branch Manager, President (high priority)

3. Document expires
   └── Notification sent to: All relevant parties, Admin
```

---

## 🔔 Notification Priority Levels

### 🔴 HIGH Priority
**Sent to:** All relevant roles
**Examples:**
- Document expiring (< 7 days)
- Transfer rejected
- Expense rejected
- Commission rejected
- Security alerts
- System errors

**UI Indicator:** Red border, "HIGH" badge

---

### 🟡 NORMAL Priority
**Sent to:** Assigned users
**Examples:**
- Transfer requests
- Expense approvals
- Commission approvals
- Document verified
- Stage changes
- Officer assigned

**UI Indicator:** Blue border, "NORMAL" badge

---

### ⚪ LOW Priority
**Sent to:** FYI recipients
**Examples:**
- Information updates
- Non-urgent reminders
- System maintenance notices
- Feature announcements

**UI Indicator:** Gray border, "LOW" badge

---

## 🎨 Notification Settings

Each user can configure their notification preferences:

### Channels:
- **In-App**: Show in notification center ✅ (Always on)
- **Email**: Send to registered email
- **Push**: Browser push notifications

### Per-Type Settings:
Users can enable/disable each notification type individually.

**Example:**
```
Branch Manager can disable:
- Low-priority stage changes
- FYI commission approvals
- Non-urgent document alerts

But should keep enabled:
- Transfer requests
- Expense approvals
- Document expiring (high priority)
```

---

## 🚦 Role-Based Filtering

### In Notifications Page:

**Admin** sees filters for:
- All types
- All priorities
- All statuses
- All branches (optional)
- All users (optional)

**Other Roles** see filters for:
- Their relevant types only
- All priorities
- All statuses
- Their branch only (if applicable)

---

## 📊 Statistics by Role

### Admin Dashboard:
```
Total: 150 notifications
Unread: 25
High Priority: 10
By Type: All types shown
```

### Branch Manager Dashboard:
```
Total: 30 notifications (branch only)
Unread: 5
High Priority: 2
By Type: Branch-relevant types only
```

---

## 🔐 Security Rules

### Firestore Rules Enforcement:
```javascript
// Users can only read their own notifications
allow read: if isAuthenticated() && (
  isAdmin() ||  // Admin sees all
  resource.data.recipientId == request.auth.uid  // Users see own
);

// Only admins can delete any notification
allow delete: if isAdmin();
```

**Result:** Even if someone tries to access another user's notifications via API, Firestore rules prevent it.

---

## 🎯 Best Practices

### For Users:
1. ✅ Check notifications daily
2. ✅ Mark as read after addressing
3. ✅ Archive old notifications
4. ✅ Configure preferences to reduce noise
5. ✅ Enable high-priority alerts
6. ✅ Use filters to find specific notifications

### For Admins:
1. ✅ Monitor system notifications
2. ✅ Review user notification patterns
3. ✅ Adjust notification rules as needed
4. ✅ Clean up old notifications periodically
5. ✅ Ensure all roles receive relevant alerts

---

## 📝 Summary

### Key Points:
- ✅ All authenticated users have access
- ✅ Each role sees only relevant notifications
- ✅ Admins have full visibility and control
- ✅ Security enforced at database level
- ✅ Customizable preferences per user
- ✅ Priority-based notification system
- ✅ Mobile and desktop responsive

### Navigation:
```
Sidebar → Notifications → View all notifications
Header → Bell Icon → Quick notification dropdown
Settings → Notification Preferences → Configure alerts
```

---

## 🎊 Ready to Use!

The notification system is fully configured with role-based access. Each user will automatically receive notifications relevant to their role and responsibilities.

**Test it now:**
1. Login as different roles
2. Navigate to "Notifications" in sidebar
3. See role-specific notifications
4. Try filtering and actions

---

**Questions?** Refer to `NOTIFICATION_IMPLEMENTATION_COMPLETE.md` for technical details.

