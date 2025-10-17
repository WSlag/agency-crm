# How to View the Partial Payment Commission Features

## 🚀 Quick Start Guide

### Step 1: Access the Application
The dev server is running. Open your browser and go to:
```
http://localhost:5173
```

### Step 2: Login with Admin/Authorized User
To see the "Record Payment" button, you must be logged in as one of these roles:
- ✅ **Admin**
- ✅ **President**
- ✅ **HO Accountant**

❌ Other roles (Branch Manager, Agent, etc.) will NOT see the payment button.

### Step 3: Navigate to Commissions

#### Option A: From Sidebar
1. Look for the sidebar navigation
2. Click on **"Commissions"** or **"Financial"** section
3. Click **"Commission Management"**

#### Option B: Direct URL
Go directly to:
```
http://localhost:5173/commissions
```

### Step 4: View a Commission

You need an **approved** or **partially_paid** commission to see the payment features.

#### From Commissions List:
1. You'll see a table of commissions
2. Look for commissions with status:
   - 🟢 **Approved** (green badge)
   - 🟠 **Partially Paid** (orange badge)
3. Click the **"View"** button or the commission row

#### Direct Commission URL:
```
http://localhost:5173/commissions/{commission-id}
```

---

## 🎯 What You Should See

### On Commission Detail Page (Approved Status):

```
┌─────────────────────────────────────────────────────┐
│  [← Back] Commission Details    [Approved 🟢]      │
└─────────────────────────────────────────────────────┘

Main Content Area:
┌─────────────────────────┐  ┌────────────────┐
│ Commission Amount       │  │ Actions        │
│ ₱50,000                │  │                │
│                        │  │ ✓ Approve      │ <- If pending
│ Type: Standard         │  │ ✗ Reject       │
│ Agent: Juan Cruz       │  │                │
│ Status: Approved       │  │ 💳 Record      │ <- THIS IS NEW!
└─────────────────────────┘  │   Payment      │
                             └────────────────┘
```

### What to Look For:

1. **"Record Payment" Button** in the Actions sidebar
   - Icon: 💳 Banknote icon
   - Text: "Record Payment"
   - Purple/Indigo gradient button

2. **If Commission is Already Partially Paid:**
   - Status badge will be 🟠 **"Partially Paid"** (orange)
   - Payment History section will appear below
   - Shows payment summary cards
   - Shows payment timeline table
   - Shows progress bar

---

## 🔍 Troubleshooting

### ❌ "I don't see the Commissions page"

**Solution 1: Check User Role**
- Only authenticated users can see commissions
- Make sure you're logged in

**Solution 2: Check Navigation**
- Look in the sidebar for "Commissions" or "Financial"
- Or go directly to: `http://localhost:5173/commissions`

### ❌ "I don't see the 'Record Payment' button"

**Possible Reasons:**

1. **Wrong User Role**
   - Only Admin, President, and HO Accountant can record payments
   - Try logging in with an admin account

2. **Wrong Commission Status**
   - Button only appears for:
     - ✅ "Approved" status
     - ✅ "Partially Paid" status
   - Button does NOT appear for:
     - ❌ "Pending" status
     - ❌ "Rejected" status
     - ❌ "Paid" status (already fully paid)

3. **Commission Not Found**
   - Make sure you have at least one commission in the database

### ❌ "I don't have any commissions"

**Solution: Create a Test Commission**

#### Option 1: Trigger Automatic Commission
1. Go to an applicant's profile
2. Advance the applicant to a commission-triggering stage:
   - **"Medical"** stage → Triggers medical commission
   - **"Transfer to HO"** stage → Triggers 1st commission
   - **"Deployed"** stage → Triggers deployment commission

#### Option 2: Manual Commission Request
1. Go to: `http://localhost:5173/commissions/new`
2. Fill in the commission request form
3. Submit the request
4. Approve it (if you're admin)

### ❌ "I see commissions but they're all 'Pending'"

**Solution: Approve a Commission**

As an Admin, President, or HO Accountant:
1. Click on a pending commission
2. Click the **"Approve Commission"** button (green button)
3. The status will change to "Approved"
4. Now the **"Record Payment"** button should appear

---

## 📱 Testing the Partial Payment Flow

### Complete Test Scenario:

#### 1. **Setup** (One-time)
```
✓ Login as Admin
✓ Navigate to Commissions page
✓ Find or create an Approved commission
```

#### 2. **Record First Payment**
```
1. Click commission to view details
2. Click "Record Payment" button (purple, in Actions sidebar)
3. Modal opens showing:
   - Total Amount: ₱50,000
   - Already Paid: ₱0
   - Remaining: ₱50,000
4. Click "Pay Half" quick button
5. Amount field fills with ₱25,000
6. (Optional) Enter payment reference: "OR-12345"
7. (Optional) Add notes: "First installment"
8. Click "Record Payment" button
9. Wait for "Processing..." spinner
10. Modal closes automatically
```

#### 3. **Verify Changes**
```
✓ Status badge changes to "Partially Paid" (orange)
✓ Payment History section appears
✓ See summary cards:
  - Total: ₱50,000
  - Paid: ₱25,000 (1 payment)
  - Remaining: ₱25,000 (50% paid)
✓ See payment in table:
  - #1, Date, ₱25,000, OR-12345
✓ See progress bar at 50%
✓ "Record Payment" button still visible
```

#### 4. **Record Final Payment**
```
1. Click "Record Payment" again
2. Modal now shows:
   - Already Paid: ₱25,000
   - Remaining: ₱25,000
3. Click "Pay Full" button
4. Amount fills with ₱25,000
5. Submit payment
6. Status changes to "Paid" (purple)
7. Progress bar shows 100%
8. "Record Payment" button disappears (commission fully paid)
```

---

## 🎨 Visual Checklist

When viewing a commission detail page with payment features, you should see:

### Actions Sidebar (Right Side)
- [ ] White card with shadow
- [ ] "Actions" header
- [ ] Action buttons (Approve/Reject if pending)
- [ ] **"Record Payment" button** (purple gradient, banknote icon)
- [ ] "Back to List" button

### Payment History Section (Below Commission Info)
Only appears if commission has payments:
- [ ] Section title: "Payment History"
- [ ] Three summary cards in a row (or stacked on mobile)
  - [ ] Blue card: Total Amount
  - [ ] Green card: Amount Paid (with payment count)
  - [ ] Yellow/Purple card: Remaining or Completed
- [ ] Payment timeline table with columns:
  - [ ] # (numbered badges with gradient)
  - [ ] Payment Date (with clock icon)
  - [ ] Amount (green badge)
  - [ ] Reference (monospace font)
  - [ ] Notes
- [ ] Progress bar (if partially paid)
  - [ ] Shows percentage
  - [ ] Animated gradient fill
  - [ ] Amount paid / total amount

### Partial Payment Modal (When Button Clicked)
- [ ] Backdrop blur overlay
- [ ] Centered modal with white background
- [ ] Close button (X) in top-right
- [ ] Title: "Record Partial Payment"
- [ ] Summary card with gradient background showing:
  - [ ] Total Amount
  - [ ] Already Paid
  - [ ] Remaining Balance
- [ ] Payment Amount input field with ₱ symbol
- [ ] Two quick action buttons:
  - [ ] "Pay Half" (indigo)
  - [ ] "Pay Full" (green)
- [ ] Payment Reference input (optional)
- [ ] Notes textarea (optional)
- [ ] Cancel button (white/gray)
- [ ] Record Payment button (green gradient)

---

## 🆘 Still Can't See It?

### Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Look for any errors (red text)
4. Share any errors you see

### Check Network Tab
1. Press `F12` to open Developer Tools
2. Go to "Network" tab
3. Refresh the page
4. Check if API calls are successful (status 200)
5. Look for failed requests (red)

### Verify File Changes
Run this command to check if files were modified:
```bash
git status
```

You should see these modified files:
- `src/types/commission.ts`
- `src/stores/commissionStore.ts`
- `src/pages/commissions/CommissionDetailPage.tsx`
- `src/pages/commissions/CommissionsPage.tsx`

And these new files:
- `src/components/commissions/PartialPaymentModal.tsx`
- `src/components/commissions/PaymentHistory.tsx`

### Clear Browser Cache
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page (`Ctrl + R` or `F5`)

### Restart Dev Server
```bash
# Stop the current server (Ctrl + C)
# Then restart:
npm run dev
```

---

## 📞 Getting Help

If you still can't see the features, provide:
1. **Screenshot** of the commission detail page
2. **Your user role** (admin, president, etc.)
3. **Commission status** you're viewing
4. **Browser console errors** (if any)
5. **URL** you're visiting

---

## ✅ Success Indicators

You'll know it's working when you see:
- ✅ "Record Payment" button appears for approved commissions
- ✅ Modal opens when clicking the button
- ✅ Payment summary shows correct amounts
- ✅ Quick action buttons work
- ✅ Payment submits successfully
- ✅ Status changes to "Partially Paid"
- ✅ Payment History section appears
- ✅ Progress bar is animated

**The features are fully implemented and ready to use!** 🎉

---

**Need Help?** Share a screenshot of what you're seeing, and I'll help you troubleshoot further.

