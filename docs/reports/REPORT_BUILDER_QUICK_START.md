# Report Builder - Quick Start Guide

## 🚀 5-Minute Quick Start

### Step 1: Access Report Builder
```
Navigate to: Reports → Report Builder
URL: /reports/builder
```

### Step 2: Fill Basic Info
```
✏️ Report Name: "My First Report"
📊 Report Type: Choose from dropdown
📝 Description: Optional
```

### Step 3: Add Filters (Optional)
```
Click "Add Filter" button
↓
Field: currentStage
Operator: Equals
Value: interview
```

### Step 4: Add Metrics (Optional)
```
Click "Add Metric" button
↓
Name: Total Count
Calculation: Count
Field: id
Format: Number
```

### Step 5: Generate!
```
Click "Generate Report" button
↓
✅ Success! Redirected to Reports List
```

---

## 📋 View Your Reports

```
Navigate to: Reports → Report List
URL: /reports/list

Actions Available:
👁️ View Details
📥 Export (CSV/PDF)
🗑️ Delete (Admin only)
```

---

## 🎯 Report Types

| Type | Purpose |
|------|---------|
| 🎓 **Applicant Status** | Track pipeline stages |
| 🔄 **Transfer Analytics** | Branch transfers |
| 💰 **Financial Summary** | Money flow |
| 💵 **Commission Report** | Agent earnings |
| 📄 **Document Verification** | Doc status |
| 🏢 **Branch Performance** | Branch KPIs |
| 👤 **Agent Performance** | Agent metrics |

---

## 🔐 Who Can Do What?

| Action | Admin | President | HO Accountant | Branch Manager |
|--------|-------|-----------|---------------|----------------|
| Create | ✅ | ✅ | ✅ | ❌ |
| View | ✅ All | ✅ All | ✅ All | ✅ Own Branch |
| Export | ✅ | ✅ | ✅ | ✅ Own |
| Delete | ✅ All | ✅ Own | ✅ Own | ❌ |

---

## 💡 Pro Tips

1. **Use Descriptive Names**
   ```
   ❌ "Report 1"
   ✅ "Q4 2025 Applicant Pipeline"
   ```

2. **Add Multiple Filters**
   ```
   Filter 1: status = active
   Filter 2: branchId = davao
   ```

3. **Combine Metrics**
   ```
   Metric 1: Count of applicants
   Metric 2: Sum of expenses
   Metric 3: Average commission
   ```

4. **Export for Analysis**
   ```
   CSV → Excel/Google Sheets (data analysis)
   PDF → Print/Share (presentations)
   ```

---

## 🎨 UI Navigation

```
Main Menu
  ↓
Reports
  ↓
  ├─ Report Builder (Create new)
  ├─ Report List (View all)
  └─ [Report Name] (View details)
```

---

## ⚡ Keyboard Shortcuts

- **Search Reports:** Click search box and type
- **Clear Filters:** Select "All Types" in dropdown
- **Quick Create:** Bookmark `/reports/builder`

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't create report | Check your role (need Admin/President/HO Accountant) |
| Export not working | Allow browser downloads/pop-ups |
| No data in report | Adjust filters or check if data exists |
| Report not found | Refresh Reports List page |

---

## 📱 Mobile Access

✅ **Fully Responsive Design**
- View reports on phone/tablet
- Create reports on desktop (recommended)
- Export works on all devices

---

## 🎉 You're Ready!

Just 3 clicks to your first report:
1. Click **Reports** in sidebar
2. Fill in **Report Name** and **Type**
3. Click **Generate Report**

**That's it! Happy Reporting! 🚀**

---

## 📚 More Resources

- **Full Guide:** `REPORT_BUILDER_IMPLEMENTATION_COMPLETE.md`
- **Testing:** `REPORT_BUILDER_TESTING_GUIDE.md`
- **Configuration:** `REPORT_BUILDER_CONFIGURATION_STATUS.md`

---

**Last Updated:** October 18, 2025

