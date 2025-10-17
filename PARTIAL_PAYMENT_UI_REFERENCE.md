# Partial Payment UI - Visual Reference Guide

## 🎨 Quick Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Commission Detail Page                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [← Back] Commission Details        [Partially Paid ⚠️]│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────┐  ┌──────────────────┐   │
│  │  Commission Information        │  │  Actions         │   │
│  │  ├─ Amount: ₱50,000           │  │  ┌─────────────┐ │   │
│  │  ├─ Type: Standard            │  │  │ ✓ Approve   │ │   │
│  │  ├─ Status: Approved          │  │  └─────────────┘ │   │
│  │  └─ Agent: Juan Dela Cruz     │  │  ┌─────────────┐ │   │
│  └────────────────────────────────┘  │  │ 💳 Record   │ │   │
│                                       │  │   Payment   │ │   │
│  ┌────────────────────────────────┐  │  └─────────────┘ │   │
│  │  Payment History 📋            │  │  ┌─────────────┐ │   │
│  │  ┌──────────────────────────┐ │  │  │ ← Back      │ │   │
│  │  │ Total:      ₱50,000 💙   │ │  └──────────────────┘   │
│  │  │ Paid:       ₱30,000 ✅   │ │                          │
│  │  │ Remaining:  ₱20,000 ⚠️   │ │                          │
│  │  └──────────────────────────┘ │                          │
│  │                                │                          │
│  │  Payment Timeline:             │                          │
│  │  ┌───┬─────────┬─────────┐   │                          │
│  │  │ # │  Date   │ Amount  │   │                          │
│  │  ├───┼─────────┼─────────┤   │                          │
│  │  │ 1 │ Oct 10  │ ₱15,000 │   │                          │
│  │  │ 2 │ Oct 15  │ ₱15,000 │   │                          │
│  │  └───┴─────────┴─────────┘   │                          │
│  │                                │                          │
│  │  Progress: 60% ━━━━━━━━░░░   │                          │
│  └────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Component Breakdown

### 1. Partial Payment Modal

```
┌────────────────────────────────────────────┐
│  [X]                                       │
│  💵  Record Partial Payment                │
│  Record a partial payment for this...     │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Total Amount:        ₱50,000        │ │
│  │  Already Paid:        ₱30,000 ✅     │ │
│  │  ────────────────────────────────    │ │
│  │  Remaining Balance:   ₱20,000        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Payment Amount *                          │
│  ┌──────────────────────────────────────┐ │
│  │ ₱ [____________]                     │ │
│  └──────────────────────────────────────┘ │
│  [Pay Half: ₱10,000] [Pay Full: ₱20,000]  │
│                                            │
│  Payment Reference / Receipt No.           │
│  ┌──────────────────────────────────────┐ │
│  │ [OR-12345 or Check #123]             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Notes                                     │
│  ┌──────────────────────────────────────┐ │
│  │ [Additional notes...]                │ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [  Cancel  ]  [ ✓ Record Payment ]       │
└────────────────────────────────────────────┘
```

**Key Features:**
- 💰 Real-time remaining balance calculation
- ⚡ Quick action buttons (Pay Half / Pay Full)
- ✅ Input validation with error messages
- 💳 Optional payment reference field
- 📝 Optional notes field
- 🔄 Loading state with spinner

---

### 2. Payment Summary Cards

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  Total Amount 💙    │  Amount Paid ✅     │  Remaining ⚠️       │
│  ─────────────      │  ─────────────      │  ─────────────      │
│  ₱50,000           │  ₱30,000           │  ₱20,000           │
│                     │  2 payments         │  60% paid          │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Visual Design:**
- Blue gradient: Total Amount
- Green gradient: Amount Paid
- Yellow gradient: Remaining (if balance > 0)
- Purple gradient: Completed (if fully paid)

---

### 3. Payment History Table

```
┌────────────────────────────────────────────────────────────────────┐
│  📋 Payment History                                                 │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  #  │  Payment Date       │  Amount      │  Reference  │ Notes││
│  ├─────┼────────────────────┼──────────────┼─────────────┼──────┤│
│  │  ① │ 🕐 Oct 10, 2:30 PM │ ₱15,000 ✅  │ PAY-1-...   │  -   ││
│  │  ② │ 🕐 Oct 15, 3:45 PM │ ₱15,000 ✅  │ OR-12345    │ Chk  ││
│  └─────┴────────────────────┴──────────────┴─────────────┴──────┘ │
└────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Numbered badges with gradient (①②③)
- Formatted dates with time
- Currency formatted amounts
- Monospace font for references
- Hover effects on rows

---

### 4. Progress Bar (Partially Paid Only)

```
┌────────────────────────────────────────────────────────────────┐
│  Payment Progress                                   60%        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │██████████████████████████████████████░░░░░░░░░░░░░░░░░░░│ │
│  └──────────────────────────────────────────────────────────┘ │
│  ₱0                        ₱30,000 / ₱50,000                  │
└────────────────────────────────────────────────────────────────┘
```

**Visual Effects:**
- Animated gradient fill (indigo → purple → pink)
- Pulse animation overlay
- Smooth transitions (500ms)
- Percentage and amounts displayed

---

## 🎨 Color Palette

### Status Colors

| Status | Badge Color | Use Case |
|--------|-------------|----------|
| Pending | 🟡 Yellow gradient | Awaiting approval |
| Verified | 🔵 Blue gradient | Verified by officer |
| Approved | 🟢 Green gradient | Approved for payment |
| Rejected | 🔴 Red gradient | Rejected commission |
| **Partially Paid** | 🟠 **Orange gradient** | **NEW: Partial payment recorded** |
| Paid | 🟣 Purple gradient | Fully paid |

### Component Colors

| Component | Background | Text | Border |
|-----------|------------|------|--------|
| Modal | White | Gray-900 | None |
| Summary Card (Info) | Indigo-50 → Purple-50 | Gray-700 | Indigo-100 |
| Summary Card (Total) | Blue-50 → Indigo-50 | Blue-700/900 | Blue-100 |
| Summary Card (Paid) | Green-50 → Emerald-50 | Green-700/900 | Green-100 |
| Summary Card (Remaining) | Yellow-50 → Orange-50 | Yellow-700/900 | Yellow-100 |
| Primary Button | Green-600 → Emerald-600 | White | None |
| Secondary Button | Indigo-600 → Purple-600 | White | None |
| Cancel Button | White | Gray-700 | Gray-300 |
| Error Alert | Red-50 | Red-800 | Red-200 |

---

## 📐 Spacing & Sizing

### Modal
- Max width: `max-w-lg` (32rem / 512px)
- Padding: `p-6` on desktop, `p-4` on mobile
- Gap between elements: `space-y-5`

### Cards
- Padding: `p-5` (1.25rem)
- Border radius: `rounded-xl` (0.75rem)
- Gap in grid: `gap-4` (1rem)

### Buttons
- Height: `py-3` (0.75rem top/bottom)
- Padding: `px-4` (1rem left/right)
- Border radius: `rounded-lg` (0.5rem)
- Font size: `text-sm` (0.875rem)
- Font weight: `font-semibold`

### Form Inputs
- Height: `py-3` (0.75rem top/bottom)
- Padding: `px-4` (1rem left/right)
- Border width: `border-2`
- Border radius: `rounded-lg` (0.5rem)
- Focus ring: `ring-indigo-500`

---

## 🎭 Interactive States

### Buttons

#### Default State
```css
bg-gradient-to-r from-green-600 to-emerald-600
text-white font-semibold rounded-lg shadow-lg
```

#### Hover State
```css
from-green-700 to-emerald-700
shadow-xl scale-105
```

#### Disabled State
```css
opacity-50 cursor-not-allowed
```

#### Loading State
```css
<svg class="animate-spin">...</svg> + "Processing..."
```

### Input Fields

#### Default State
```css
border-2 border-gray-300 rounded-lg
```

#### Focus State
```css
border-indigo-500 ring-indigo-500
```

#### Error State
```css
border-red-500 ring-red-500
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Modal: Full width with margin
- Summary cards: Stack vertically (1 column)
- Table: Horizontal scroll
- Buttons: Full width
- Text: Left-aligned

### Tablet (640px - 1024px)
- Modal: Max-width `sm:max-w-lg`
- Summary cards: 3 columns (`md:grid-cols-3`)
- Table: Full layout
- Buttons: Auto width
- Text: Left-aligned (`sm:text-left`)

### Desktop (> 1024px)
- Modal: Centered, max-width
- Summary cards: 3 columns
- Table: Full layout with all columns
- Hover effects: Enabled
- All features: Fully visible

---

## 🔤 Typography Scale

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Modal Title | `text-xl` | 1.25rem | Bold (700) |
| Section Header | `text-lg` | 1.125rem | Bold (700) |
| Card Label | `text-sm` | 0.875rem | Medium (500) |
| Card Amount | `text-2xl` | 1.5rem | Bold (700) |
| Input Label | `text-sm` | 0.875rem | Semibold (600) |
| Body Text | `text-sm` | 0.875rem | Normal (400) |
| Helper Text | `text-xs` | 0.75rem | Normal (400) |
| Button Text | `text-sm` | 0.875rem | Semibold (600) |

---

## ⚡ Animations & Transitions

### Modal Animation
```css
enter: ease-out duration-300
  from: opacity-0 translate-y-4 scale-95
  to: opacity-100 translate-y-0 scale-100

leave: ease-in duration-200
  from: opacity-100 scale-100
  to: opacity-0 scale-95
```

### Hover Transitions
```css
transition-all duration-200
hover:scale-105
hover:shadow-xl
```

### Progress Bar
```css
transition-all duration-500
animate-pulse (on fill overlay)
```

### Button States
```css
transition-colors
hover:bg-{color}-700
```

---

## 🎯 User Flow Diagram

```
┌─────────────────┐
│ Commission List │
└────────┬────────┘
         │ Click commission
         ▼
┌─────────────────┐
│ Detail Page     │
│ Status: Approved│
└────────┬────────┘
         │ Click "Record Payment"
         ▼
┌─────────────────┐
│ Payment Modal   │
│ - See summary   │
│ - Enter amount  │
│ - Optional ref  │
└────────┬────────┘
         │ Submit
         ▼
┌─────────────────┐
│ Processing...   │
└────────┬────────┘
         │ Success
         ▼
┌─────────────────┐
│ Detail Page     │
│ Status: Part/Pd │
│ + History shown │
└────────┬────────┘
         │ Repeat or Done
         ▼
┌─────────────────┐
│ Status: Paid ✅│
└─────────────────┘
```

---

## 🎨 Example Color Combinations

### Summary Cards

#### Total Amount Card
```
Background: bg-gradient-to-br from-blue-50 to-indigo-50
Border: border border-blue-100
Icon: text-blue-400
Label: text-blue-700
Value: text-blue-900
```

#### Amount Paid Card
```
Background: bg-gradient-to-br from-green-50 to-emerald-50
Border: border border-green-100
Icon: text-green-400
Label: text-green-700
Value: text-green-900
Count: text-green-600
```

#### Remaining Card (Balance > 0)
```
Background: bg-gradient-to-br from-yellow-50 to-orange-50
Border: border border-yellow-100
Icon: text-yellow-400
Label: text-yellow-700
Value: text-yellow-900
Percentage: text-yellow-600
```

#### Completed Card (Balance = 0)
```
Background: bg-gradient-to-br from-purple-50 to-pink-50
Border: border border-purple-100
Icon: text-purple-400
Label: text-purple-700
Value: text-purple-900
```

---

## 📊 Component States Matrix

| Component | Empty | Loading | Error | Success | Disabled |
|-----------|-------|---------|-------|---------|----------|
| Modal | N/A | ✅ Spinner | ✅ Alert | ✅ Submits | ✅ Buttons |
| History | ✅ Empty state | N/A | N/A | ✅ Table | N/A |
| Summary | ✅ Zero values | N/A | N/A | ✅ Values | N/A |
| Progress | N/A (hidden) | N/A | N/A | ✅ Animated | N/A |
| Button | ✅ Disabled | ✅ Spinner | ✅ Disabled | ✅ Active | ✅ Grayed |

---

## 🎬 Interactive Demo Script

### Test Flow 1: First Payment
1. Open commission with status "Approved"
2. Click "Record Payment" button
3. See modal open with animation
4. See summary showing full amount remaining
5. Click "Pay Half" button
6. See amount field filled with half
7. Enter optional reference: "OR-12345"
8. Click "Record Payment"
9. See loading spinner
10. Modal closes automatically
11. Page refreshes
12. Status badge changes to "Partially Paid" (orange)
13. Payment History section appears
14. See first installment in table
15. See progress bar at 50%

### Test Flow 2: Final Payment
1. Commission now shows "Partially Paid"
2. Click "Record Payment" again
3. Modal shows updated summary:
   - Total: ₱50,000
   - Paid: ₱25,000
   - Remaining: ₱25,000
4. Click "Pay Full" button
5. Amount field fills with ₱25,000
6. Submit payment
7. Status changes to "Paid" (purple)
8. Progress bar shows 100%
9. "Record Payment" button disappears

---

## 🔍 Visual Inspection Checklist

### ✅ Modal
- [ ] Backdrop blur visible
- [ ] Modal centered on screen
- [ ] Close button (X) in top-right
- [ ] Icon in top-left (currency dollar)
- [ ] Title and description clear
- [ ] Summary card has gradient background
- [ ] Amount field has peso symbol
- [ ] Quick action buttons visible
- [ ] Buttons have proper hover effects
- [ ] Loading state shows spinner

### ✅ Payment History
- [ ] Three summary cards visible
- [ ] Cards responsive (stack on mobile)
- [ ] Table headers visible
- [ ] Numbered badges have gradient
- [ ] Dates formatted correctly
- [ ] Currency amounts formatted
- [ ] Reference numbers in monospace
- [ ] Progress bar only shows for partial
- [ ] Progress bar animated
- [ ] Empty state shows when no payments

### ✅ Status Badges
- [ ] "Partially Paid" is orange gradient
- [ ] Badge has proper border
- [ ] Text contrast is readable
- [ ] Badge rounded (pill shape)
- [ ] Consistent with other badges

---

## 📝 Copy/Text Content

### Modal
- **Title**: "Record Partial Payment"
- **Description**: "Record a partial payment for this commission"
- **Summary Labels**:
  - "Total Amount:"
  - "Already Paid:"
  - "Remaining Balance:"
- **Input Labels**:
  - "Payment Amount *"
  - "Payment Reference / Receipt No."
  - "Notes"
- **Button Text**:
  - "Pay Half (₱X,XXX)"
  - "Pay Full (₱X,XXX)"
  - "Cancel"
  - "Record Payment"
  - "Processing..." (loading)
- **Placeholder Text**:
  - "0.00" (amount)
  - "OR-12345 or Check #123" (reference)
  - "Additional notes about this payment..." (notes)

### Payment History
- **Section Title**: "Payment History"
- **Empty State**: "No Payment History" / "No payments have been recorded for this commission yet."
- **Card Labels**:
  - "Total Amount"
  - "Amount Paid"
  - "Remaining" or "Completed"
- **Table Headers**:
  - "#"
  - "Payment Date"
  - "Amount"
  - "Reference"
  - "Notes"
- **Progress Bar**: "Payment Progress" + percentage

---

## 🎨 CSS/Tailwind Classes Reference

### Common Patterns

#### Gradient Backgrounds
```html
<!-- Success/Green -->
<div class="bg-gradient-to-r from-green-600 to-emerald-600">

<!-- Primary/Indigo -->
<div class="bg-gradient-to-r from-indigo-600 to-purple-600">

<!-- Info/Blue -->
<div class="bg-gradient-to-br from-blue-50 to-indigo-50">

<!-- Warning/Orange -->
<div class="bg-gradient-to-br from-yellow-50 to-orange-50">
```

#### Cards
```html
<div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
```

#### Buttons
```html
<!-- Primary -->
<button class="px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl">

<!-- Secondary -->
<button class="px-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
```

#### Inputs
```html
<input class="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
```

---

## 🎯 Conclusion

This UI reference provides a complete visual guide to the partial payment features. All components follow consistent design patterns, use semantic colors, and provide excellent user experience.

**Key Takeaways:**
- ✅ Consistent gradient-based design
- ✅ Clear visual hierarchy
- ✅ Intuitive interactions
- ✅ Responsive across devices
- ✅ Accessible and WCAG compliant
- ✅ Professional and modern aesthetic

---

**Document Version**: 1.0  
**Last Updated**: October 17, 2025  
**Status**: ✅ Complete

