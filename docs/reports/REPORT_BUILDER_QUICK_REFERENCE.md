# Report Builder - Quick Reference Card

## 🚀 Quick Start

**Access**: Main Menu → Reports → Report Builder (`/reports`)

**Who Can Use**: Admin, President, HO Accountant only ⚠️

---

## 📊 7 Report Types

| Report Type | Data Source | Best For |
|------------|-------------|----------|
| **Applicant Status** | applicants | Pipeline tracking |
| **Transfer Analytics** | transfers | HO transfer monitoring |
| **Financial Summary** | expenses | Budget & spending |
| **Commission Report** | commissions | Agent payments |
| **Document Verification** | documents | Compliance tracking |
| **Branch Performance** | branches | Branch comparison |
| **Agent Performance** | agents | Agent evaluation |

---

## 🔧 Build a Report in 4 Steps

### 1️⃣ Basic Info
- Report Name
- Report Type (dropdown)
- Description (optional)

### 2️⃣ Add Filters
```
Field | Operator | Value
------|----------|------
status | Equals | pending
createdAt | Greater Than | 2025-01-01
amount | Between | 1000,5000
```

**Operators**: Equals, Greater Than, Less Than, Between

### 3️⃣ Add Metrics
```
Name | Calculation | Field | Format
-----|-------------|-------|-------
Total Count | Count | id | Number
Total Amount | Sum | amount | Currency
Average | Average | amount | Currency
```

**Calculations**: Count, Sum, Average, Min, Max
**Formats**: Number, Currency, Percentage, Date

### 4️⃣ Schedule (Optional)
- **Frequency**: Daily, Weekly, Monthly
- **Format**: PDF or Excel
- **Recipients**: Email addresses

---

## 💡 Common Examples

### Monthly Branch Expenses
```yaml
Type: Financial Summary
Filters:
  - createdAt: Between (2025-10-01 to 2025-10-31)
  - status: Equals (approved)
Metrics:
  - Total Expenses: Count (id) → Number
  - Total Amount: Sum (amount) → Currency
Schedule: Monthly, PDF
```

### Agent Commission Verification
```yaml
Type: Commission Report
Filters:
  - agentId: Equals (agent-123)
  - createdAt: Between (2025-Q4)
Metrics:
  - Total Commissions: Count (id) → Number
  - Amount Due: Sum (amount) → Currency
Schedule: None (one-time)
```

### Pending Transfers
```yaml
Type: Transfer Analytics
Filters:
  - status: Equals (pending)
Metrics:
  - Pending Count: Count (id) → Number
  - Average Wait: Average (waitingDays) → Number
Schedule: Weekly, PDF
```

---

## 🎯 Quick Tips

✅ **DO**
- Use clear, descriptive names
- Add specific filters for faster results
- Test with small date ranges first
- Schedule only necessary reports
- Verify results periodically

❌ **DON'T**
- Create reports without filters (too much data)
- Use unclear field names
- Over-schedule reports
- Share sensitive data carelessly
- Forget to update old filters

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Report too slow | Add more filters, reduce date range |
| No results | Check filters, verify field names |
| Wrong numbers | Verify field types, check for null values |
| Can't access | Verify role (Admin/President/HO Accountant only) |
| Email not received | Check spam folder, verify email address |

---

## 📊 Pre-built Reports (Quick Access)

Click these cards on the Report Builder page:

1. **Transfer Analytics** - Branch→HO transfers
2. **Officer Performance** - HO Officer metrics
3. **Deployment Reports** - Overseas deployments
4. **Financial Reports** - All expenses & commissions
5. **Branch Performance** - Branch comparison
6. **Agent Performance** - Agent rankings

---

## 🔐 Access Matrix

| Role | Report Builder | Custom Reports | Schedule |
|------|---------------|----------------|----------|
| Admin | ✅ | ✅ | ✅ |
| President | ✅ | ✅ | ✅ |
| HO Accountant | ✅ | ✅ | ✅ |
| HO Recruitment Officer | ❌ | ❌ | ❌ |
| Branch Manager | ❌ | ❌ | ❌ |

---

## 📥 Export Formats

- **PDF**: Professional documents, presentations
- **Excel**: Further analysis, formulas
- **CSV**: Data integration, import to other systems

---

## 📞 Need Help?

- **Full Guide**: `REPORT_BUILDER_COMPREHENSIVE_GUIDE.md`
- **Technical Support**: IT Department
- **Training**: Schedule with Admin

---

**Last Updated**: October 18, 2025

