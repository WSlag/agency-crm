# Missing Notifications - Quick Reference

## Overview
Out of 15 major operations in the system, **only 5 have notification triggers**. This document lists the **10 missing notifications** that need to be implemented.

---

## 🚨 Critical Priority (Implement First)

### 1. Commission Payment ❌
**File**: `src/stores/commissionStore.ts` (Line 479-520)
**Notify**: Agent, HO Accountant, Admins
**When**: Commission is paid (full or partial)
**Why Critical**: Agents need to know they've been paid

### 2. Commission Approval ❌
**File**: `src/stores/commissionStore.ts` (Line 440-478)
**Notify**: Agent, HO Accountant, Admins
**When**: Commission is approved
**Why Critical**: Agents need to know their commission was approved

### 3. Expense Approval ❌
**File**: `src/stores/expenseStore.ts` (Line 407-443)
**Notify**: Expense Creator, HO Accountant, Admins
**When**: Expense is approved for payment
**Why Critical**: Users need to know their expense claim was approved

### 4. Expense Rejection ❌
**File**: `src/stores/expenseStore.ts` (Line 385-406)
**Notify**: Expense Creator, Branch Manager
**When**: Expense is rejected
**Why Critical**: Users need to know why their claim was rejected

---

## ⚠️ High Priority (Implement Next)

### 5. Agent Creation ❌
**File**: `src/stores/agentStore.ts` (Line 215-252)
**Notify**: Admins, Presidents, Branch Manager
**When**: New agent is registered
**Why Important**: Track new agents entering the system

### 6. Expense Creation ❌
**File**: `src/stores/expenseStore.ts` (Line 200-244)
**Notify**: HO Accountant, Branch Manager (if >threshold), Admins
**When**: New expense is submitted
**Why Important**: Accountants need to be alerted to verify/approve

### 7. Commission Rejection ❌
**File**: `src/stores/commissionStore.ts` (Line 407-438)
**Notify**: Agent, Branch Manager, Admins
**When**: Commission is rejected
**Why Important**: Agents need feedback on rejection

### 8. Expense Verification ❌
**File**: `src/stores/expenseStore.ts` (Line 346-383)
**Notify**: Expense Creator, HO Accountant, Admins
**When**: Expense is verified or rejected
**Why Important**: Feedback loop for expense process

---

## 📌 Medium Priority (Nice to Have)

### 9. Agent Updates ❌
**File**: `src/stores/agentStore.ts` (Line 254-292)
**Notify**: Agent, Branch Manager, Admins
**When**: Agent info updated (especially commission or status)
**Why Useful**: Track significant changes

### 10. Agent Deletion ❌
**File**: `src/stores/agentStore.ts` (Line 294-318)
**Notify**: Admins, Presidents, Branch Manager
**When**: Agent is deleted
**Why Useful**: Record keeping and audit trail

---

## Quick Implementation Template

```typescript
// Add after the main operation succeeds
try {
  const notificationsRef = collection(firestore, 'notifications');
  const recipients: string[] = [];

  // Query recipients based on roles
  const adminQuery = query(
    collection(firestore, 'users'),
    where('role', '==', 'admin')
  );
  const adminSnapshot = await getDocs(adminQuery);
  adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

  // Create notifications
  for (const recipientId of recipients) {
    await addDoc(notificationsRef, {
      type: 'operation_type',
      title: 'Notification Title',
      body: 'Notification message with details',
      priority: 'medium',
      status: 'unread',
      recipientId: recipientId,
      recipientEmail: '',
      icon: '📌',
      metadata: { /* relevant data */ },
      createdAt: Timestamp.now(),
    });
  }

  console.log(`✅ Sent ${recipients.length} notifications`);
} catch (notifError) {
  console.error('Error sending notifications:', notifError);
  // Don't fail the main operation
}
```

---

## Current vs Target Status

| Module | Current | Target | Progress |
|--------|---------|--------|----------|
| Users | 1/1 ✅ | 1 | 100% |
| Branches | 1/1 ✅ | 1 | 100% |
| Applicants | 2/3 ✅ | 3 | 67% |
| Agents | 0/3 ❌ | 3 | 0% |
| Expenses | 0/4 ❌ | 4 | 0% |
| Commissions | 0/3 ❌ | 3 | 0% |
| **TOTAL** | **4/15** | **15** | **27%** |

---

## Estimated Time

- **Critical Priority**: 4-6 hours
- **High Priority**: 3-4 hours  
- **Medium Priority**: 2-3 hours

**Total**: 9-13 hours to complete all

---

## Who Should Be Notified? (By Role)

### Admin
- Everything (all operations)

### President
- Agent operations
- High-value commissions
- Applicant registrations

### Branch Manager
- Agents in their branch
- Expenses from their branch
- Applicants in their branch

### HO Accountant
- ALL expenses
- ALL commissions
- Payment operations

### Agent
- Their own commissions
- Their own updates
- Status changes

### HO Recruitment Officer
- Assigned applicants
- Document verifications

---

## Next Action

**Start with the 4 Critical Priority notifications** - these have the highest business impact and affect user satisfaction directly.

1. Commission Payment
2. Commission Approval
3. Expense Approval
4. Expense Rejection

These 4 alone will cover the most important user feedback loops!

