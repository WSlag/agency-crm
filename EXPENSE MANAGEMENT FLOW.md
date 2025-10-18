Quick Summary
Expense Status Flow:
PENDING → VERIFIED → APPROVED → PAID
   ↓         ↓
REJECTED   REJECTED

👥 User Roles & What They Can Do
🔴 ADMIN - Full Control
✅ Create expenses (HO & Branch)
✅ Verify expenses
✅ Approve expenses
✅ Record payments
✅ View all expenses
✅ Access all reports
🟣 PRESIDENT - Approval Only
❌ Cannot create expenses
❌ Cannot verify
✅ Approve verified expenses
❌ Cannot record payments
✅ View all expenses
🔵 HO ACCOUNTANT - Financial Processor
✅ Create HO expenses only
✅ Verify all expenses (primary role)
❌ Cannot approve
✅ Record payments (primary role)
✅ View all expenses
🟢 BRANCH MANAGER - Submitter Only
✅ Submit branch expenses only
❌ Cannot verify
❌ Cannot approve
❌ Cannot record payments
🟡 View branch expenses only
💰 8 Expense Types
Type	Receipt Required	Applicant Required	Currency
Passport Fees	✅ Yes	✅ Yes	PHP
Travel	✅ Yes	❌ No	PHP, USD
Staff Allowance	❌ No	❌ No	PHP
Office	✅ Yes	❌ No	PHP
Medical	✅ Yes	✅ Yes	PHP
Training	✅ Yes	✅ Yes	PHP, USD
Documentation	✅ Yes	✅ Yes	PHP
Other	✅ Yes	❌ No	PHP, USD
🔄 Complete Workflow Example
Scenario: Branch Manager Submits Passport Fee
Day 1 - SUBMISSION (Branch Manager)
1. Pay applicant's passport fee: ₱3,500
2. Go to /expenses/new
3. Fill form:
   • Type: Passport Fees
   • Amount: ₱3,500
   • Applicant: John Doe
   • Upload receipt
   • Description: "Passport fee for deployment"
4. Submit → Status: PENDING ⏳

Day 2 - VERIFICATION (HO Accountant)
1. Dashboard shows "Pending Expenses"
2. Go to /expenses
3. Click on expense
4. Review checklist:
   ✅ Valid receipt attached
   ✅ Amount matches: ₱3,500
   ✅ Applicant exists
   ✅ Receipt date valid
5. Click "Verify" → Status: VERIFIED ✓

Day 3 - APPROVAL (President or Admin)
1. Go to /expenses
2. Filter: Status = "Verified"
3. Click on expense
4. Review:
   • Verified by HO Accountant ✅
   • All checks passed ✅
   • Amount reasonable ✅
5. Click "Approve" → Status: APPROVED ✓

Day 4 - PAYMENT (HO Accountant)
1. Filter: Status = "Approved"
2. Make actual bank transfer to branch manager
3. In system:
   • Click "Record Payment"
   • Amount: ₱3,500
   • Method: Bank Transfer
   • Reference: TXN-2025-67890
4. Submit → Status: PAID ✅

Branch Manager receives notification and bank transfer

Total Time: 4 days ✅

📍 Key Pages
Page	URL	Who Can Access
Expense List	/expenses	All (filtered by role)
New Expense	/expenses/new	Admin, HO Accountant, Branch Manager
Expense Detail	/expenses/:id	Based on permissions
Budget Management	/expenses/budget	Admin, President
Financial Dashboard	/financial-dashboard	Admin, President, HO Accountant
✅ Verification Checklist (HO Accountant)
Passport Fees
✅ Valid receipt attached
✅ Amount matches receipt
✅ Applicant details correct
✅ Receipt date valid
Travel Expenses
✅ Valid receipt attached
✅ Amount matches receipt
✅ Travel dates valid
✅ Purpose specified
Office Expenses
✅ Valid receipt attached
✅ Amount matches receipt
✅ Expense category specified
✅ Business purpose clear
Medical Expenses
✅ Valid medical receipt
✅ Amount matches receipt
✅ Medical facility details
✅ Treatment details provided
💡 Best Practices
For Branch Managers ✅
Submit within 30 days
Attach clear, legible receipts
Provide detailed descriptions
Link to applicants when applicable
Keep original receipts
For HO Accountant ✅
Verify within 2 business days
Check all verification items
Provide clear rejection reasons
Process payments promptly
Cannot verify own expenses
For Admin/President ✅
Review regularly
Approve within 3 business days
Check verification results
Question unusual expenses
Monitor expense trends
🚨 Common Issues & Solutions
"Cannot Submit Expense"
Check all required fields filled
Upload receipt if required
Link applicant if required
"Expense Rejected"
Read rejection reason
Fix identified issues
Resubmit as new expense
"Cannot Verify Own Expense"
By design (conflict of interest)
Admin or another accountant must verify
"Payment Delayed"
Check expense status (should be "Approved")
Contact HO Accountant
Verify bank details correct
📊 Permission Matrix Summary
Action	Admin	President	HO Accountant	Branch Manager
Create Expense	✅ All	❌	✅ HO Only	✅ Branch Only
Verify Expense	✅	❌	✅	❌
Approve Expense	✅	✅	❌	❌
Record Payment	✅	❌	✅	❌
View All	✅	✅	✅	🟡 Branch Only
📞 Quick Contact
Expense Questions: HO Accountant
Approval Status: Admin/President
Payment Status: HO Accountant
System Issues: Admin