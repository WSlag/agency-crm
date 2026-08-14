# Report Builder - Testing Guide

## 🧪 Quick Testing Steps

### Prerequisites
- ✅ User must be logged in
- ✅ User must have appropriate role (Admin, President, or HO Accountant to create)

---

## 📝 Test 1: Create Your First Report

### Step-by-Step:

1. **Navigate to Report Builder**
   - Go to: `http://localhost:5173/reports/builder` (or `/reports`)
   - OR click **Reports** in the sidebar

2. **Fill in Basic Information**
   ```
   Report Name: Monthly Applicant Summary
   Report Type: Applicant Status
   Description: Summary of all applicants for the month
   ```

3. **Add Filters (Optional)**
   - Click **"Add Filter"**
   - Example Filter:
     ```
     Field: currentStage
     Operator: Equals
     Value: interview
     ```
   - You can add multiple filters

4. **Add Metrics (Optional)**
   - Click **"Add Metric"**
   - Example Metric:
     ```
     Metric Name: Total Applicants
     Calculation: Count
     Field: id
     Format: Number
     ```

5. **Click "Generate Report"**
   - Wait for success message: "Report generated successfully!"
   - You'll be automatically redirected to Reports List

---

## 📋 Test 2: View Reports List

### Step-by-Step:

1. **Navigate to Reports List**
   - Go to: `http://localhost:5173/reports/list`
   - You should see the report you just created

2. **Test Search**
   - Type "Monthly" in the search box
   - Verify your report appears

3. **Test Filter**
   - Select "Applicant Status" from the type dropdown
   - Verify only applicant reports show

4. **Test Sort**
   - Try "Sort by Date" (newest first)
   - Try "Sort by Name" (A-Z)

---

## 👁️ Test 3: View Report Details

### Step-by-Step:

1. **Click the Eye Icon** on your report
   - OR navigate to: `/reports/{reportId}`

2. **Verify Information Displayed**
   - ✅ Report name and type
   - ✅ Created date and last updated
   - ✅ Description (if provided)
   - ✅ Applied filters (if any)
   - ✅ Metrics (if any)

3. **Test Export to CSV**
   - Click **"Export CSV"** button
   - Verify a `.csv` file downloads
   - Open in Excel/Google Sheets to verify data

4. **Test Export to PDF**
   - Click **"Export PDF"** button
   - Verify a `.pdf` file downloads
   - Open to verify content (currently plain text format)

---

## 🗑️ Test 4: Delete Report (Admin Only)

### Step-by-Step:

1. **From Report Detail Page**
   - Click the **"Delete"** button (red button)

2. **Confirm Deletion**
   - Click "OK" in the confirmation dialog

3. **Verify Redirect**
   - You should be redirected to Reports List
   - The deleted report should no longer appear

---

## 🎯 Test Different Report Types

Try creating reports for each type to ensure they all work:

### 1. Applicant Status Report
```
Report Type: Applicant Status
Purpose: Track pipeline stages
Filter: currentStage = "interview"
Metric: Count of applicants
```

### 2. Financial Summary Report
```
Report Type: Financial Summary
Purpose: Expenses and commissions overview
Filter: date between 2025-01-01 and 2025-12-31
Metric: Sum of amount
```

### 3. Commission Report
```
Report Type: Commission Report
Purpose: Agent commission tracking
Filter: status = "paid"
Metric: Sum of amount, Count of commissions
```

### 4. Branch Performance Report
```
Report Type: Branch Performance
Purpose: Compare branch metrics
Filter: (none for all branches)
Metric: Count by branchId
```

### 5. Agent Performance Report
```
Report Type: Agent Performance
Purpose: Agent effectiveness
Filter: status = "active"
Metric: Count of applicants per agent
```

---

## 🔐 Test Role-Based Access

### As Admin:
- ✅ Should see "Create Report" button
- ✅ Can create reports
- ✅ Can view all reports
- ✅ Can delete reports

### As President:
- ✅ Should see "Create Report" button
- ✅ Can create reports
- ✅ Can view all reports
- ❌ Cannot delete reports (only own)

### As HO Accountant:
- ✅ Should see "Create Report" button
- ✅ Can create reports
- ✅ Can view all reports
- ❌ Cannot delete reports (only own)

### As Branch Manager:
- ❌ Should NOT see "Create Report" button
- ❌ Cannot create reports
- ✅ Can view reports for own branch
- ❌ Cannot delete reports

---

## 🐛 Common Issues & Solutions

### Issue 1: "Report not found" error
**Solution:** The report ID might be invalid. Go back to Reports List and try again.

### Issue 2: Export not downloading
**Solution:** Check browser's download settings. Ensure pop-ups are allowed.

### Issue 3: No data in exported report
**Solution:** The filters might be too restrictive. Try removing filters or adjusting values.

### Issue 4: "Permission denied" error
**Solution:** Ensure you're logged in with the correct role. Check Firestore rules.

---

## ✅ Expected Results

### After Creating a Report:
- ✅ Green success message appears
- ✅ Redirected to `/reports/list`
- ✅ New report appears in the list
- ✅ Report has correct type badge color

### After Exporting:
- ✅ File downloads automatically
- ✅ Filename includes report name and timestamp
- ✅ CSV opens in spreadsheet software
- ✅ PDF opens in document viewer

### After Deleting:
- ✅ Confirmation dialog appears
- ✅ Report removed from list
- ✅ Redirected back to list

---

## 🎨 Visual Checks

### Report Builder Page:
- ✅ Gradient header (indigo → purple → pink)
- ✅ Quick action cards for common reports
- ✅ Form sections with icons
- ✅ Success/error messages styled properly

### Reports List Page:
- ✅ Search bar with magnifying glass icon
- ✅ Filter dropdowns with icons
- ✅ Report cards with gradient top border
- ✅ Type badges with appropriate colors
- ✅ Action buttons (eye, download, trash)

### Report Detail Page:
- ✅ Gradient header with report name
- ✅ Information cards (white with subtle borders)
- ✅ Colored sections for filters/metrics
- ✅ Export buttons prominent in header

---

## 🚀 Performance Testing

### Load Testing:
1. Create 10+ reports
2. Navigate to Reports List
3. Verify page loads quickly
4. Test search and filter performance

### Export Testing:
1. Create a report with large dataset
2. Export to CSV
3. Verify file size and data completeness
4. Open in Excel to check formatting

---

## 📊 Data Validation

### CSV Export Should Include:
- ✅ Column headers (human-readable)
- ✅ Data rows with all requested fields
- ✅ Proper escaping of special characters
- ✅ Formatted values (currency, dates, etc.)

### PDF Export Should Include:
- ✅ Report name and description
- ✅ Generated timestamp
- ✅ Summary statistics
- ✅ Data table (if applicable)

---

## ✨ Success Criteria

Your Report Builder implementation is working correctly if:

- ✅ You can create a report without errors
- ✅ The report appears in the list immediately
- ✅ You can view report details
- ✅ CSV export downloads and opens correctly
- ✅ PDF export downloads (even if basic format)
- ✅ Search and filter work as expected
- ✅ Role-based access is enforced
- ✅ UI is beautiful and responsive
- ✅ No console errors

---

## 🎉 All Tests Passed?

If all the above tests pass, congratulations! Your Report Builder is **fully functional** and ready for use!

---

**Happy Testing! 🚀**

