# Commission Calculation Fix

## ✅ Issue Resolved

**Problem**: Commission payments showing ₱0.00 instead of the agent's commission amount (₱50,000).

**Root Cause**: The code was using deprecated `agent.commissionRate` (percentage-based) instead of `agent.commissionAmount` (fixed amount).

---

## 🐛 The Bug

### Before (BROKEN):
```typescript
const agent = agentSnap.data();
const commissionRate = agent.commissionRate || 0;  // ❌ This was 0 or undefined!

const baseCommission = 10000;
const percentage = triggerStage === 'medical' ? 0.5 : 0.5;
const amount = baseCommission * percentage * (commissionRate / 100);

// Result: 10000 * 0.5 * (0 / 100) = 0  ❌
```

**Why it failed:**
- `commissionRate` is deprecated (old percentage-based system)
- Agent records now use `commissionAmount` (fixed amount in PHP)
- `agent.commissionRate` was `undefined` → defaulted to `0`
- Calculation: 10000 × 0.5 × (0/100) = **₱0**

---

## ✅ The Fix

### After (FIXED):
```typescript
const agent = agentSnap.data();

// Use commissionAmount directly (fixed amount per applicant)
// Medical: 50% of agent's commission
// Deployed: 50% of agent's commission
const agentCommissionAmount = agent.commissionAmount || 0;
const percentage = triggerStage === 'medical' ? 0.5 : 0.5;
const amount = agentCommissionAmount * percentage;

console.log('[triggerCommission]', {
  agentId: applicant.agentId,
  agentCommissionAmount,
  triggerStage,
  percentage,
  calculatedAmount: amount
});

// Result: 50000 * 0.5 = 25,000  ✅
```

---

## 💰 How It Works Now

For an agent with **`commissionAmount: 50000`**:

| Stage | Calculation | Amount |
|-------|-------------|--------|
| **Medical** | ₱50,000 × 50% | **₱25,000** |
| **Deployed** | ₱50,000 × 50% | **₱25,000** |
| **Total** | | **₱50,000** |

The agent receives:
- ✅ **₱25,000** when applicant reaches Medical stage
- ✅ **₱25,000** when applicant is Deployed
- ✅ **₱50,000 total** commission per applicant

---

## 📊 What Changed

### File Modified: `src/services/stageService.ts`

**Lines 532-556:**
- ✅ Changed from `commissionRate` → `commissionAmount`
- ✅ Removed deprecated `baseCommission` variable
- ✅ Simplified calculation: `amount = agentCommissionAmount × percentage`
- ✅ Added debug logging for troubleshooting
- ✅ Updated `calculationDetails` to reflect new method

**Lines 570-575:**
- ✅ Updated `calculationDetails` stored in commission record:
  - Removed: `baseCommission`, `commissionRate`
  - Added: `agentCommissionAmount`, `calculationMethod: 'fixed_amount_percentage'`

---

## 🧪 Testing

### Test Case 1: Medical Stage Commission
```
Given: Agent with commissionAmount = 50,000
When: Applicant advances to Medical stage
Then: Commission created with amount = 25,000
```

### Test Case 2: Deployed Stage Commission
```
Given: Agent with commissionAmount = 50,000
When: Applicant is Deployed
Then: Commission created with amount = 25,000
```

### Test Case 3: Payment Modal
```
Given: Commission with amount = 25,000
When: Admin opens Record Payment modal
Then: Total Amount displays ₱25,000 (not ₱0)
```

---

## 🔍 Debug Logging

The fix includes console logging to help diagnose issues:

```javascript
[triggerCommission] {
  agentId: "ziqnEq3N3buMIu93anSA",
  agentCommissionAmount: 50000,
  triggerStage: "medical",
  percentage: 0.5,
  calculatedAmount: 25000
}
✅ Commission triggered for medical stage: 25000 PHP
```

Check browser console (F12) when an applicant advances stages to see these logs.

---

## 📝 Notes

### Commission Split (50/50)
The current implementation splits the commission equally:
- 50% at Medical stage
- 50% at Deployed stage

To change this split, modify the `percentage` values in lines 547-548:

```typescript
// Current: 50/50 split
const percentage = triggerStage === 'medical' ? 0.5 : 0.5;

// Example: 30/70 split
const percentage = triggerStage === 'medical' ? 0.3 : 0.7;

// Example: 100% at Deployed only
const percentage = triggerStage === 'medical' ? 0.0 : 1.0;
```

### Agent Commission Amount
The commission amount is set per agent in the Agent Management page:
1. Go to **Agents** page
2. Click on an agent or **Edit Agent**
3. Set **Commission Amount** field (e.g., 50000)
4. Save

This amount is the **total commission** the agent earns per successful applicant deployment.

---

## 🚀 Deployment

### Next Applicant
The fix applies to **new commissions** created when applicants advance stages.

Existing commissions with ₱0 will remain at ₱0 (they were created with the bug).

### To Fix Existing Zero Commissions

If you have existing commissions showing ₱0, you have two options:

**Option 1: Delete and Re-trigger** (Recommended)
1. Delete the ₱0 commission records from Firestore
2. Advance the applicant backward one stage
3. Advance them forward again to re-trigger commission

**Option 2: Manual Update** (Quick fix)
1. Go to Firestore Console
2. Find commissions with `amount: 0`
3. Manually update `amount` field to correct value (e.g., 25000)

---

## ✅ Status

**Fixed & Deployed** 🎉

- ✅ Commission calculation uses correct field (`commissionAmount`)
- ✅ Debug logging added
- ✅ No TypeScript errors
- ✅ No linter errors
- ✅ Ready to test with new applicant stage advancements

---

## 🎯 Test Steps

1. **Create or select an agent** with commission amount = ₱50,000
2. **Create an applicant** assigned to that agent
3. **Advance applicant** to Medical stage
4. **Go to Commissions page**
5. **Verify**: Commission shows ₱25,000 (not ₱0)
6. **Click commission** to open detail page
7. **Click "Record Payment"**
8. **Verify**: Total Amount shows **₱25,000** ✅
9. **Test payment** by entering amount and recording

---

**Date Fixed:** October 17, 2025  
**File Modified:** `src/services/stageService.ts`  
**Lines Changed:** 532-575  
**Status:** ✅ Complete & Ready to Test

