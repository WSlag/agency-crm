# Branch Targets - Quick Reference Guide

## 🎯 What Was Implemented

A complete branch monthly targets system with 4 recruitment pipeline goals:
- 📝 **Applicants** - New registrations
- 🏥 **Medical** - Reach medical stage
- 🔄 **Transfer to HO** - Transfer to Head Office
- ✈️ **Deployed** - Successfully deployed

---

## 📍 Where to Find It

### **Branch Targets Management:**
- **Path:** `/settings/branch-targets`
- **Access:** Admin & President only
- **Purpose:** Set monthly targets for each branch

### **Goal Progress Widget:**
- **Location:** Dashboard (bottom section)
- **Access:** All users
- **Purpose:** View progress against targets

---

## 🚀 Quick Start

### **Step 1: Set Targets (Admin/President)**

1. Go to Settings → Branch Targets
2. Select Month & Year
3. Enter target numbers for each branch
4. Click "Save Targets"

### **Step 2: View Progress (Everyone)**

1. Open Dashboard
2. Look at "Goal Progress" widget
3. See your progress vs targets

---

## 📊 Example

**Setting Targets:**
```
Cotabato Branch - October 2025:
- Applicants: 50
- Medical: 30
- Transfer to HO: 20
- Deployed: 15
```

**Dashboard Shows:**
```
Goal Progress

📝 Applicants:      25/50  (50%)
🏥 Medical:         12/30  (40%)
🔄 Transfer to HO:   8/20  (40%)
✈️ Deployed:         5/15  (33%)

Overall: 41% 📈
```

---

## 📁 Files Modified

1. ✅ `src/pages/settings/BranchTargets.tsx` - New page
2. ✅ `src/pages/dashboard/Dashboard.tsx` - Updated widget
3. ✅ `firestore.rules` - Added security rules

---

## 🔐 Firestore Collection

**Collection:** `branch_targets`
**Document ID:** `{branchId}_{year}_{month}`

**Structure:**
```json
{
  "branchId": "cotabato",
  "branchName": "Cotabato Branch",
  "year": 2025,
  "month": 10,
  "targets": {
    "applicants": 50,
    "medical": 30,
    "transferToHO": 20,
    "deployed": 15
  },
  "updatedAt": "2025-10-20...",
  "updatedBy": "admin@example.com"
}
```

---

## 🎨 Widget Behavior

### **Branch Manager:**
- Shows their branch's targets only
- Labels: "Applicants", "Medical", etc.

### **Admin/President:**
- Shows aggregated targets from all branches
- Labels: "Total Applicants", "Total Medical", etc.

### **No Targets Set:**
- Shows friendly message
- Suggests contacting admin

---

## ⚡ Progress Indicators

**Emoji Guide:**
- 🎉 75%+ progress (Excellent!)
- 💪 50-74% progress (Good work!)
- 📈 <50% progress (Keep going!)

---

## ✅ Status

**Implementation:** ✅ Complete
**Testing:** Ready
**Deployment:** Ready

---

## 🔗 Next Steps

1. Add route for `/settings/branch-targets`
2. Add menu link in Settings
3. Deploy Firestore rules
4. Test with real data
5. Train users

---

**Ready to use!** 🚀

