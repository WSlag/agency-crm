# System Settings - Commission Model Update

**Date:** October 18, 2025  
**Change:** Updated Financial Settings to reflect fixed commission amounts instead of percentages  
**Status:** ✅ **COMPLETED**

---

## 🎯 **What Changed**

### Before (Incorrect):
```
❌ Minimum Commission Rate (%)
❌ Maximum Commission Rate (%)
```
- Implied percentage-based commissions
- Didn't match actual business model
- Confusing for admins

### After (Correct):
```
✅ Minimum Commission Amount (PHP)
✅ Maximum Commission Amount (PHP)
```
- Reflects fixed amount per placement
- Matches actual commission calculation
- Clear business logic

---

## 📊 **Your Commission Business Model**

### How It Actually Works:

**Agent Commission = Fixed Amount Per Successful Placement**

**Example:**
- Agent Maria: `commissionAmount: 10,000 PHP`
- When applicant reaches **Medical Transfer** stage:
  - Maria receives: **5,000 PHP** (50% of her total)
- When applicant **Deployed**:
  - Maria receives: **5,000 PHP** (remaining 50%)

**Total:** 10,000 PHP per successful placement (split into 2 payments)

---

## 🔧 **Technical Changes**

### 1. Schema Update

**Before:**
```typescript
financial: z.object({
  currency: z.string().min(1),
  commissionRateRange: z.object({  // ❌ Called "Rate"
    min: z.number().min(0),
    max: z.number().max(100),      // ❌ Max 100 (for %)
  }),
  requireReceiptUpload: z.boolean(),
}),
```

**After:**
```typescript
financial: z.object({
  currency: z.string().min(1),
  commissionAmountRange: z.object({  // ✅ Called "Amount"
    min: z.number().min(0),
    max: z.number().min(0),          // ✅ No max limit constraint
  }),
  requireReceiptUpload: z.boolean(),
}),
```

### 2. Default Values Update

**Before:**
```typescript
commissionRateRange: {
  min: 0,
  max: 20,  // Implied 20% max
}
```

**After:**
```typescript
commissionAmountRange: {
  min: 5000,   // 5,000 PHP minimum
  max: 25000,  // 25,000 PHP maximum
}
```

### 3. UI Labels Update

**Updated Labels:**
- "Minimum Commission Rate (%)" → "Minimum Commission Amount (PHP)"
- "Maximum Commission Rate (%)" → "Maximum Commission Amount (PHP)"

**Added Helper Text:**
- "Minimum fixed amount per agent placement"
- "Maximum fixed amount per agent placement"

**Added Placeholders:**
- Min: `5000`
- Max: `25000`

---

## 💡 **Purpose of These Settings**

### Minimum Commission Amount
**Use Case:** Set floor to prevent undervaluing agents
- Example: `5,000 PHP` = No agent should earn less than this per placement
- Ensures fair compensation

### Maximum Commission Amount
**Use Case:** Set ceiling to control costs
- Example: `25,000 PHP` = No agent should earn more than this per placement
- Protects profit margins
- Standardizes compensation ranges

---

## 🎯 **How Commissions Are Set**

### Current System Flow:

1. **Agent Profile** → `commissionAmount` field
   - Set when creating/editing agent
   - Example: 10,000 PHP, 15,000 PHP, 20,000 PHP

2. **System Settings** (Optional Enforcement)
   - Min: 5,000 PHP (suggested floor)
   - Max: 25,000 PHP (suggested ceiling)
   - Note: Not currently enforced in code

3. **Commission Triggers**
   - Medical Transfer: 50% of agent's amount
   - Deployment: Remaining 50% of agent's amount

---

## 📝 **Data Structure**

### Firestore Document: `system_settings/general`

**Before:**
```json
{
  "financial": {
    "currency": "PHP",
    "commissionRateRange": {
      "min": 0,
      "max": 20
    },
    "requireReceiptUpload": true
  }
}
```

**After:**
```json
{
  "financial": {
    "currency": "PHP",
    "commissionAmountRange": {
      "min": 5000,
      "max": 25000
    },
    "requireReceiptUpload": true
  }
}
```

---

## ⚠️ **Important Notes**

### 1. Existing Data Migration
If you already have settings saved with `commissionRateRange`, the old data will remain in Firestore. When you save new settings, it will use `commissionAmountRange`.

**No breaking changes** - the system continues to work with agent-specific `commissionAmount` values.

### 2. Settings Are Not Currently Enforced
The min/max values in System Settings are **guidelines** only. The actual commission calculation uses the `commissionAmount` field from each agent's profile.

**Future Enhancement:** Add validation when creating/editing agents to enforce these limits.

### 3. Currency Alignment
The labels now explicitly show "PHP" to match the default currency. If you change the currency dropdown, the commission amounts should be interpreted in that currency.

---

## 🧪 **Testing**

**Test Steps:**
1. Navigate to `/settings/system`
2. Scroll to "Financial Settings"
3. ✅ Should see "Minimum Commission Amount (PHP)"
4. ✅ Should see "Maximum Commission Amount (PHP)"
5. ✅ Placeholders show "5000" and "25000"
6. ✅ Helper text explains these are "fixed amounts per placement"
7. Change values to your business needs (e.g., Min: 8,000, Max: 30,000)
8. Click "Save Settings"
9. ✅ Should see success message

---

## 🎨 **UI Improvements**

### Visual Changes:
- ✅ Clear field labels (no more confusion about %)
- ✅ Placeholder values (5000, 25000)
- ✅ Helper text below each field
- ✅ Consistent with your business model

### User Experience:
- **Before:** Admin sees "%" and wonders how it's calculated
- **After:** Admin sees "PHP amount" and understands it's fixed per placement

---

## 📚 **Related Documentation**

**Commission Flow:**
- See: `COMMISSION_FLOW_USER_ROLES.md`
- Agent gets 50% at Medical, 50% at Deployment
- Total = agent's `commissionAmount` field

**Where Commission Amount Is Set:**
- Agent Management → Edit Agent → Commission Amount field
- This is the **fixed PHP amount** per placement

---

## ✅ **Summary**

**What Changed:**
- ✅ Field name: `commissionRateRange` → `commissionAmountRange`
- ✅ Labels: "Rate (%)" → "Amount (PHP)"
- ✅ Defaults: 0-20 → 5,000-25,000
- ✅ Added helper text and placeholders
- ✅ Aligned with actual business model

**Impact:**
- ✅ Settings now match reality
- ✅ Less confusion for admins
- ✅ Clear business logic
- ✅ Ready for future enforcement

---

**Status:** ✅ **UPDATED & READY TO USE**

Refresh the System Settings page to see the changes!

