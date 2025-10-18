# Report Builder - Comprehensive User Guide

## 📊 Overview

The **Report Builder** is a powerful analytics and reporting tool in the Agency CRM system that allows authorized users to create custom reports, analyze data, and schedule automated report generation. It provides insights into various aspects of the recruitment agency operations including applicants, commissions, expenses, transfers, branch performance, and agent performance.

### Purpose
- **Data Analysis**: Generate comprehensive reports to understand business operations
- **Performance Tracking**: Monitor KPIs across branches, agents, and officers
- **Financial Oversight**: Track expenses, commissions, and financial summaries
- **Decision Making**: Provide data-driven insights for strategic planning
- **Compliance**: Maintain records and audit trails
- **Automation**: Schedule recurring reports to be sent automatically

---

## 🔐 User Access & Permissions

### Who Can Access Report Builder?

The Report Builder is **restricted to senior management roles** only:

| Role | Access Level | Can View | Can Create | Can Schedule |
|------|-------------|----------|------------|--------------|
| **Admin** | ✅ Full Access | ✅ All Reports | ✅ Custom Reports | ✅ Yes |
| **President** | ✅ Full Access | ✅ All Reports | ✅ Custom Reports | ✅ Yes |
| **HO Accountant** | ✅ Full Access | ✅ All Reports | ✅ Custom Reports | ✅ Yes |
| **HO Recruitment Officer** | ❌ No Access | ❌ | ❌ | ❌ |
| **Branch Manager** | ❌ No Access | ❌ | ❌ | ❌ |

**Important**: Branch Managers and HO Recruitment Officers cannot access the Report Builder. They receive specific pre-generated reports through their dashboards.

### Access Path
```
Main Menu → Reports → Report Builder
URL: /reports
```

---

## 📋 Available Report Types

The Report Builder supports **7 main report types**:

### 1. **Applicant Status Report** 📝
**Purpose**: Track applicant progress through recruitment pipeline

**Data Source**: `applicants` collection

**Key Metrics**:
- Total applicants
- Applicants by stage (Registration, Interview, Medical, Transfer, Processing, Deployment, Deployed)
- Applicants by branch
- Applicants by agent
- Applicants by status (active, inactive, cancelled)
- Processing time per stage
- Applicant distribution over time

**Use Cases**:
- Monitor pipeline health
- Identify bottlenecks in recruitment process
- Track branch-specific applicant volumes
- Analyze agent productivity

**Example Filters**:
- Date range (createdAt)
- Branch ID
- Agent ID
- Current stage
- Status

---

### 2. **Transfer Analytics Report** 🔄
**Purpose**: Analyze branch-to-HO transfer operations

**Data Source**: `transfers` collection

**Key Metrics**:
- Total transfers
- Pending transfers
- Approved transfers
- Average approval time
- Transfers by branch
- Transfers by assigned officer
- Transfer processing duration

**Use Cases**:
- Monitor transfer request volume
- Identify slow approval processes
- Track officer workload distribution
- Analyze branch-to-HO handoff efficiency

**Example Filters**:
- Date range (requestedAt)
- From branch
- To branch (usually HO)
- Assigned officer
- Transfer status

---

### 3. **Financial Summary Report** 💰
**Purpose**: Comprehensive financial overview

**Data Source**: `expenses` collection

**Key Metrics**:
- Total expenses
- Expenses by type (Medical, Travel, Documentation, Processing, Deployment)
- Expenses by status (pending, verified, approved, paid, rejected)
- Total approved amount
- Expenses by branch
- Expenses by applicant
- Monthly expense trends

**Use Cases**:
- Budget tracking
- Financial forecasting
- Expense approval monitoring
- Branch spending analysis
- Applicant-specific cost tracking

**Example Filters**:
- Date range (expenseDate, createdAt)
- Expense type
- Branch ID
- Status
- Amount range

---

### 4. **Commission Report** 💵
**Purpose**: Agent commission tracking and payment management

**Data Source**: `commissions` collection

**Key Metrics**:
- Total commissions
- Commissions by agent
- Commissions by type (Medical Placement 50%, Deployment 50%)
- Commission status (pending, verified, approved, paid)
- Total paid amount
- Total pending amount
- Commission trends over time
- Agent performance rankings

**Use Cases**:
- Agent payment processing
- Commission liability tracking
- Agent performance evaluation
- Payment scheduling
- Commission budget management

**Example Filters**:
- Date range (createdAt)
- Agent ID
- Branch ID
- Commission type (medical, deployed)
- Status
- Amount range

---

### 5. **Document Verification Report** 📄
**Purpose**: Track document submission and verification status

**Data Source**: `documents` collection

**Key Metrics**:
- Total documents
- Documents by type (Passport, Medical Certificate, NBI Clearance, etc.)
- Documents by status (pending, verified, rejected)
- Verification turnaround time
- Documents by applicant
- Documents by branch
- Rejection reasons

**Use Cases**:
- Document processing efficiency
- Compliance tracking
- Identify missing documents
- Monitor verification officer workload
- Quality control

**Example Filters**:
- Date range (uploadedAt)
- Document type
- Status
- Applicant ID
- Branch ID
- Verified by

---

### 6. **Branch Performance Report** 🏢
**Purpose**: Comprehensive branch analytics

**Data Source**: `branches` collection + aggregated data

**Key Metrics**:
- Applicants per branch
- Deployed applicants per branch
- Branch expenses
- Branch commissions
- Transfer volume (outgoing to HO)
- Agent count per branch
- Deployment rate
- Average processing time
- Document accuracy rate

**Use Cases**:
- Branch comparison
- Identify high-performing branches
- Resource allocation
- Branch manager evaluation
- Regional strategy planning

**Example Filters**:
- Branch ID
- Date range
- Status (active/inactive branches)
- Performance thresholds

---

### 7. **Agent Performance Report** 🎯
**Purpose**: Individual agent productivity and earnings

**Data Source**: `agents` collection + aggregated data

**Key Metrics**:
- Applicants recruited per agent
- Deployed applicants
- Total commissions earned
- Paid commissions
- Pending commissions
- Deployment success rate
- Average processing time
- Agent ranking
- Monthly performance trends

**Use Cases**:
- Agent evaluation
- Commission calculation verification
- Top performer identification
- Agent recruitment strategy
- Performance-based incentives

**Example Filters**:
- Agent ID
- Branch ID
- Date range
- Performance metrics
- Commission thresholds

---

## 🛠️ How to Use the Report Builder

### Step 1: Access Report Builder
1. Log in as **Admin**, **President**, or **HO Accountant**
2. Navigate to **Reports** in the main menu
3. The Report Builder page opens automatically

### Step 2: Choose Report Type
You have two options:

#### Option A: Quick Reports (Pre-built Templates)
The Report Builder page shows quick access cards for common reports:
- **Transfer Analytics** - Branch to HO transfers
- **Officer Performance** - HO Recruitment Officers
- **Deployment Reports** - Overseas deployments
- **Financial Reports** - Expenses & Commissions
- **Branch Performance** - All branches
- **Agent Performance** - Agent metrics

**Click any card** to navigate to a pre-configured report with default filters.

#### Option B: Custom Report Builder
Scroll down to the form to create a fully customized report.

---

### Step 3: Create Custom Report

#### 3.1 Basic Information

**Report Name** (Required)
- Enter a descriptive name (e.g., "Q4 2025 Branch Expenses")
- This name will be used to identify the report in the system

**Report Type** (Required)
- Select from dropdown:
  - Applicant Status
  - Transfer Analytics
  - Financial Summary
  - Commission Report
  - Document Verification
  - Branch Performance
  - Agent Performance

**Description** (Optional)
- Add details about what the report will show
- Helpful for future reference

---

#### 3.2 Add Filters

Filters narrow down the data included in your report.

**To Add a Filter:**
1. Click **"+ Add Filter"** button
2. Enter three pieces of information:
   - **Field name**: The data field to filter (e.g., "status", "branchId", "createdAt")
   - **Operator**: How to compare the value
     - **Equals**: Exact match
     - **Greater Than**: Values higher than specified
     - **Less Than**: Values lower than specified
     - **Between**: Values within a range
   - **Value**: The value to compare against

**Example Filters:**
```
Filter 1:
- Field: status
- Operator: Equals
- Value: pending

Filter 2:
- Field: createdAt
- Operator: Greater Than
- Value: 2025-01-01

Filter 3:
- Field: amount
- Operator: Between
- Value: 1000,5000
```

**To Remove a Filter:**
- Click the red trash icon (🗑️) next to the filter

**No Filters Added:**
- Report will include ALL data from the collection (may be very large!)

---

#### 3.3 Add Metrics

Metrics define what calculations to perform on the data.

**To Add a Metric:**
1. Click **"+ Add Metric"** button
2. Enter four pieces of information:
   - **Metric Name**: Display name for this metric (e.g., "Total Amount")
   - **Calculation**: Type of calculation
     - **Count**: Number of records
     - **Sum**: Add up all values
     - **Average**: Calculate mean
     - **Minimum**: Find lowest value
     - **Maximum**: Find highest value
   - **Field**: Which field to calculate (e.g., "amount", "id")
   - **Format**: How to display the result
     - **Number**: Plain number (e.g., 150)
     - **Currency**: Money format (e.g., ₱1,500.00)
     - **Percentage**: Percent format (e.g., 75%)
     - **Date**: Date format

**Example Metrics:**
```
Metric 1:
- Name: Total Expenses
- Calculation: Count
- Field: id
- Format: Number

Metric 2:
- Name: Total Amount
- Calculation: Sum
- Field: amount
- Format: Currency

Metric 3:
- Name: Average Expense
- Calculation: Average
- Field: amount
- Format: Currency
```

**To Remove a Metric:**
- Click the red trash icon (🗑️) next to the metric

**No Metrics Added:**
- Report will show raw data without summary calculations

---

#### 3.4 Schedule Report (Optional)

Automate report generation and delivery.

**Frequency**
- **Daily**: Report generated every day at midnight
- **Weekly**: Report generated every Monday
- **Monthly**: Report generated on the 1st of each month

**Report Period**
- **PDF**: Portable document format (for viewing/printing)
- **Excel**: Spreadsheet format (for further analysis)

**Recipients**
- Add email addresses of people who should receive the report
- Multiple recipients can be added
- Reports are sent automatically based on the schedule

**Example Schedule:**
```
Frequency: Monthly
Format: PDF
Recipients:
- admin@agency.com
- president@agency.com
- accountant@agency.com
```

---

### Step 4: Generate Report

1. Review all settings (name, type, filters, metrics, schedule)
2. Click **"Create Report"** button (bottom right)
3. System processes the report:
   - Queries Firestore database
   - Applies filters
   - Calculates metrics
   - Generates summary
   - Saves report result
4. Navigate back to reports list
5. Your new report appears in the list

---

## 📊 Report Results & Output

### What You Get

When a report is generated, the system creates a **Report Result** that includes:

1. **Definition**: Your original report configuration
2. **Data**: Array of filtered and processed records
3. **Summary**: Calculated metrics in an easy-to-read format
4. **Metadata**: 
   - Generated at (timestamp)
   - Generated by (user who created it)
   - Report ID
   - Status (completed, failed, processing)

### Viewing Reports

**Reports List** (`/reports`)
- Shows all generated reports
- Sortable by date, type, name
- Click any report to view details

**Report Detail View**
- Full data table
- Summary metrics at the top
- Export options (PDF, Excel, CSV)
- Share options (email, download)
- Re-run option (regenerate with same settings)

### Exporting Reports

**PDF Export**
- Professional formatted document
- Includes headers, footers, page numbers
- Summary charts and graphs
- Data tables
- Ideal for presentations and meetings

**Excel Export**
- Spreadsheet with raw data
- Each row is a record
- Summary metrics in separate sheet
- Formulas included
- Ideal for further analysis

**CSV Export**
- Comma-separated values
- Lightweight format
- Import into other systems
- Ideal for data integration

---

## 🎯 Common Use Cases & Examples

### Use Case 1: Monthly Expense Report for Each Branch

**Goal**: Track how much each branch spent last month

**Steps:**
1. Report Type: `Financial Summary`
2. Report Name: "October 2025 Branch Expenses"
3. Filters:
   - Field: `createdAt`, Operator: `Between`, Value: `2025-10-01 to 2025-10-31`
   - Field: `status`, Operator: `Equals`, Value: `approved`
4. Metrics:
   - Metric: "Total Expenses", Calculation: `Count`, Field: `id`, Format: `Number`
   - Metric: "Total Amount", Calculation: `Sum`, Field: `amount`, Format: `Currency`
5. Group By: `branchId` (if supported)
6. Schedule: Monthly, PDF format, send to President and HO Accountant

**Result**: Report showing expenses per branch for October 2025

---

### Use Case 2: Agent Commission Verification

**Goal**: Verify commissions due to a specific agent

**Steps:**
1. Report Type: `Commission Report`
2. Report Name: "Agent XYZ Commissions - Q4 2025"
3. Filters:
   - Field: `agentId`, Operator: `Equals`, Value: `[agent-id-here]`
   - Field: `createdAt`, Operator: `Between`, Value: `2025-10-01 to 2025-12-31`
4. Metrics:
   - Metric: "Total Commissions", Calculation: `Count`, Field: `id`, Format: `Number`
   - Metric: "Total Amount Due", Calculation: `Sum`, Field: `amount`, Format: `Currency`
   - Metric: "Already Paid", Calculation: `Sum`, Field: `paidAmount`, Format: `Currency`
5. Schedule: None (one-time report)

**Result**: Detailed commission breakdown for the agent

---

### Use Case 3: Branch Performance Comparison

**Goal**: Compare all branches' deployment rates

**Steps:**
1. Report Type: `Branch Performance`
2. Report Name: "Branch Performance - 2025 Annual"
3. Filters:
   - Field: `status`, Operator: `Equals`, Value: `active`
4. Metrics:
   - Metric: "Total Applicants", Calculation: `Count`, Field: `applicants`, Format: `Number`
   - Metric: "Deployed", Calculation: `Count`, Field: `deployedApplicants`, Format: `Number`
   - Metric: "Deployment Rate", Calculation: `Average`, Field: `deploymentRate`, Format: `Percentage`
5. Sort By: Deployment Rate (Descending)
6. Schedule: Quarterly, Excel format

**Result**: Ranked list of branches by performance

---

### Use Case 4: Pending Transfer Tracking

**Goal**: Monitor transfers awaiting HO approval

**Steps:**
1. Report Type: `Transfer Analytics`
2. Report Name: "Pending Transfers - Weekly Check"
3. Filters:
   - Field: `status`, Operator: `Equals`, Value: `pending`
4. Metrics:
   - Metric: "Pending Count", Calculation: `Count`, Field: `id`, Format: `Number`
   - Metric: "Oldest Transfer", Calculation: `Min`, Field: `requestedAt`, Format: `Date`
   - Metric: "Average Wait Time", Calculation: `Average`, Field: `waitingDays`, Format: `Number`
5. Schedule: Weekly, PDF format, send to President

**Result**: Weekly report of transfers needing attention

---

### Use Case 5: Document Verification Efficiency

**Goal**: Measure how quickly documents are being verified

**Steps:**
1. Report Type: `Document Verification`
2. Report Name: "Document Processing Times - Monthly"
3. Filters:
   - Field: `status`, Operator: `Equals`, Value: `verified`
   - Field: `verifiedAt`, Operator: `Between`, Value: `[last-month-range]`
4. Metrics:
   - Metric: "Documents Verified", Calculation: `Count`, Field: `id`, Format: `Number`
   - Metric: "Average Processing Time", Calculation: `Average`, Field: `processingHours`, Format: `Number`
   - Metric: "Fastest Verification", Calculation: `Min`, Field: `processingHours`, Format: `Number`
   - Metric: "Slowest Verification", Calculation: `Max`, Field: `processingHours`, Format: `Number`
5. Schedule: Monthly, Excel format

**Result**: Insights into document verification efficiency

---

## 🔧 Advanced Features

### Grouping Data

When you specify **Group By** fields, the report will:
- Aggregate data by those fields
- Create subtotals for each group
- Show items within each group

**Example**: Group by `branchId`
- Section 1: Davao Branch (5 applicants, ₱10,000 total)
- Section 2: Cotabato Branch (3 applicants, ₱7,500 total)
- Section 3: North Branch (8 applicants, ₱15,000 total)

### Sorting Data

Use **Sort By** to order results:
- Sort by any field
- Ascending (A-Z, 1-9, oldest-newest)
- Descending (Z-A, 9-1, newest-oldest)
- Multiple sort fields (primary, secondary, tertiary)

**Example**: Sort by `deploymentRate DESC, applicantCount DESC`
- Shows highest-performing branches first
- Within same deployment rate, shows branches with more applicants first

### Date Range Filters

For time-based analysis:
- Use `createdAt`, `updatedAt`, `expenseDate`, `verifiedAt`, etc.
- Operator: `Between`
- Value: `start-date,end-date`

**Common Date Ranges:**
- Last 7 days
- Last 30 days
- Last quarter
- Last year
- Year-to-date
- Custom range

---

## 📊 Pre-built Report Templates

### Quick Access Reports (Pre-configured)

These reports are accessible via cards on the Report Builder page:

#### 1. **Transfer Analytics**
- **Type**: Transfer Analytics
- **Filters**: None (shows all transfers)
- **Metrics**: Count, Average approval time
- **Best for**: Daily transfer monitoring

#### 2. **Officer Performance**
- **Type**: Officer Performance (custom)
- **Filters**: Active officers only
- **Metrics**: Assignments, Completion rate
- **Best for**: HO Recruitment Officer evaluation

#### 3. **Deployment Reports**
- **Type**: Applicant Status
- **Filters**: Stage = Deployed
- **Metrics**: Count by country, by month
- **Best for**: Deployment tracking and compliance

#### 4. **Financial Reports**
- **Type**: Financial Summary
- **Filters**: None (all expenses and commissions)
- **Metrics**: Total, By type, By status
- **Best for**: Monthly financial review

#### 5. **Branch Performance**
- **Type**: Branch Performance
- **Filters**: Active branches
- **Metrics**: All performance indicators
- **Best for**: Branch comparison and ranking

#### 6. **Agent Performance**
- **Type**: Agent Performance
- **Filters**: Active agents
- **Metrics**: Applicants, Commissions, Deployment rate
- **Best for**: Agent evaluation and bonuses

---

## 🚨 Limitations & Considerations

### Technical Limitations

1. **Query Size**: Reports with very large datasets (>10,000 records) may be slow
2. **Firestore Limits**: Some complex filters may require composite indexes
3. **Real-time Data**: Reports show data at the time of generation (not live)
4. **Concurrent Users**: Multiple users generating reports simultaneously may experience delays

### Data Limitations

1. **Historical Data**: Only includes data that exists in Firestore
2. **Deleted Records**: Deleted items won't appear in reports
3. **Incomplete Data**: Records with missing fields may affect calculations
4. **Date Accuracy**: Depends on accurate timestamp data entry

### Filter Limitations

1. **Complex Queries**: Some advanced filters may not be supported
2. **Multiple Conditions**: Limited to sequential AND conditions (no OR)
3. **Nested Fields**: Deep object traversal may not be supported
4. **Array Fields**: Filtering array contents has limitations

### Metric Limitations

1. **Calculation Types**: Only 5 basic calculations (count, sum, average, min, max)
2. **Custom Formulas**: Cannot create custom formulas
3. **Cross-collection**: Metrics limited to one collection at a time
4. **Null Handling**: Null/undefined values may skew averages

---

## 🔄 Does Report Builder Function Differently for Each User?

### Answer: **Yes and No**

#### ✅ Same for All Authorized Users

**All authorized users (Admin, President, HO Accountant) have:**
- Same access to Report Builder interface
- Same report types available
- Same ability to create custom reports
- Same export and scheduling options
- Same pre-built report templates

#### ❌ Different Based on Context

**What varies by user:**

1. **Data Visibility**
   - Reports show data based on user's overall permissions
   - However, Report Builder users (Admin, President, HO Accountant) typically have full data access
   - No automatic branch-level filtering in Report Builder

2. **Scheduling Recipients**
   - Users typically add their own email to scheduled reports
   - May include colleagues based on organizational structure

3. **Usage Patterns**
   - **Admin**: Focuses on system-wide reports, user management analytics
   - **President**: Focuses on strategic performance metrics, branch comparisons
   - **HO Accountant**: Focuses on financial reports, commission verification, expense tracking

4. **Report Purposes**
   - Different users create reports for different business needs
   - But the tool functionality remains the same

### Branch Managers & HO Recruitment Officers

**⚠️ These roles CANNOT access Report Builder**

Instead, they receive:
- **Pre-generated reports** in their dashboards
- **Filtered views** limited to their scope:
  - Branch Managers: Only their branch data
  - HO Recruitment Officers: Only their assigned applicants
- **Basic metrics** via dashboard widgets
- **Notifications** for key events (transfers, approvals, etc.)

**Why the restriction?**
- **Security**: Prevents unauthorized access to company-wide data
- **Simplicity**: Avoids overwhelming users with complex reporting tools
- **Focus**: Keeps operational users focused on their core responsibilities
- **Data Integrity**: Reduces risk of incorrect queries affecting system performance

---

## 💡 Best Practices

### Creating Reports

1. **Start Simple**: Begin with basic filters and metrics, add complexity gradually
2. **Test Filters**: Create a test report with narrow filters before adding all metrics
3. **Name Clearly**: Use descriptive names with dates (e.g., "Q4 2025 Branch Expenses")
4. **Document Purpose**: Use description field to explain why the report exists
5. **Schedule Strategically**: Don't over-schedule reports that rarely change

### Managing Data

1. **Regular Cleanup**: Archive old reports to keep the list manageable
2. **Consistent Naming**: Use a naming convention (e.g., "YYYY-MM - Type - Description")
3. **Share Wisely**: Only schedule reports to people who need them
4. **Verify Results**: Spot-check report data against source records periodically
5. **Update Filters**: Review and update filters quarterly to reflect business changes

### Performance Optimization

1. **Limit Date Ranges**: Use smaller date windows for faster results
2. **Add Specific Filters**: More filters = less data = faster reports
3. **Avoid Peak Times**: Generate large reports during off-peak hours
4. **Use Pagination**: For very large datasets, consider splitting into multiple reports
5. **Monitor Indexes**: Work with developers to add Firestore indexes for common queries

### Security & Compliance

1. **Sensitive Data**: Be cautious with reports containing personal information
2. **Secure Distribution**: Use encrypted email for scheduled reports
3. **Access Review**: Periodically review who has Report Builder access
4. **Audit Trail**: Reports are logged; avoid creating unnecessary reports
5. **Data Retention**: Follow company policy for report archival and deletion

---

## 🆘 Troubleshooting

### Common Issues

#### Issue 1: Report Takes Too Long to Generate
**Symptoms**: Report runs for >30 seconds, may timeout

**Causes:**
- Very large dataset
- Missing Firestore indexes
- Complex filters
- Server overload

**Solutions:**
- Add more specific filters to reduce data
- Use smaller date ranges
- Generate during off-peak hours
- Contact technical support to add database indexes

---

#### Issue 2: Empty or Incomplete Results
**Symptoms**: Report returns no data or less data than expected

**Causes:**
- Too restrictive filters
- Incorrect field names
- Data doesn't match filter criteria
- Typo in filter values

**Solutions:**
- Remove filters one by one to identify the issue
- Check field names against Firestore schema
- Verify filter values (spelling, case-sensitivity)
- Try "equals" operator first before complex ones

---

#### Issue 3: Metric Calculations Seem Wrong
**Symptoms**: Numbers don't match expectations

**Causes:**
- Wrong calculation type selected
- Null/empty values in data
- Wrong field selected
- Data type mismatch

**Solutions:**
- Verify field contains numeric data
- Check for null values in source data
- Use correct field name (check spelling)
- Review sample data to understand values

---

#### Issue 4: Can't Access Report Builder
**Symptoms**: Menu item missing or "Access Denied" error

**Causes:**
- Insufficient permissions
- User role not authorized
- Session expired

**Solutions:**
- Verify you're logged in as Admin, President, or HO Accountant
- Log out and log back in
- Contact system administrator to verify your role
- Check user profile settings

---

#### Issue 5: Scheduled Reports Not Arriving
**Symptoms**: Email not received on schedule

**Causes:**
- Wrong email address
- Email in spam/junk folder
- Schedule not saved properly
- System error

**Solutions:**
- Verify email address in schedule settings
- Check spam/junk folders
- Re-create schedule and save again
- Contact technical support if issue persists

---

## 📞 Support & Resources

### Getting Help

**Technical Support**
- For system errors, contact IT support
- Provide: Report ID, error message, timestamp

**Training**
- Schedule one-on-one training sessions
- Request group training for team members
- Review this guide periodically

**Feature Requests**
- Submit enhancement ideas to development team
- Explain business need and expected benefit

### Additional Resources

**Related Documentation**:
- User Role Guide
- Financial Management Guide
- Data Export Guide
- Firestore Security Rules

**Video Tutorials** (if available):
- Creating Your First Report
- Advanced Filters and Metrics
- Scheduling and Automation
- Reading and Interpreting Results

---

## 🔮 Future Enhancements

### Planned Features (Roadmap)

1. **Visual Report Designer**: Drag-and-drop interface for building reports
2. **Custom Calculations**: Create formulas like `(field1 + field2) / field3`
3. **Cross-Collection Joins**: Combine data from multiple sources
4. **Dashboard Integration**: Embed reports directly in main dashboard
5. **Real-time Reports**: Live-updating reports for critical metrics
6. **Export Templates**: Save export configurations for reuse
7. **Report Sharing**: Share reports with external stakeholders
8. **Chart Builder**: Add graphs, pie charts, bar charts to reports
9. **Conditional Formatting**: Highlight values based on rules
10. **Report Versioning**: Track changes to report configurations

---

## 📝 Summary

The Report Builder is a comprehensive tool for creating custom analytics reports in the Agency CRM system. It provides:

✅ **7 Report Types**: Covering all major business areas
✅ **Custom Filters**: Narrow down data to specific criteria  
✅ **Calculated Metrics**: Count, sum, average, min, max
✅ **Automated Scheduling**: Daily, weekly, monthly reports
✅ **Multiple Export Formats**: PDF, Excel, CSV
✅ **Role-Based Access**: Admin, President, HO Accountant only

**Key Takeaways:**
- Report Builder is for **senior management only**
- **Pre-built templates** available for common reports
- **Custom reports** can be created with filters and metrics
- Reports can be **scheduled** for automatic generation
- Results can be **exported** in multiple formats
- System logs all report generation for **audit purposes**

**Get Started Today:**
1. Log in as authorized user
2. Navigate to Reports
3. Choose a pre-built template or create custom report
4. Add filters and metrics
5. Generate and review
6. Schedule for regular delivery

---

## 📄 Document Information

**Version**: 1.0
**Last Updated**: October 18, 2025
**Prepared By**: System Documentation Team
**For**: Agency CRM Users (Admin, President, HO Accountant)
**Classification**: Internal Use Only

---

**Questions or feedback?** Contact the system administrator or submit a support ticket.

