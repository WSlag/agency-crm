# Report Builder Enhancement - Testing Checklist

## ✅ Pre-Flight Checks

- [x] driver.js installed (v1.3.6) ✅
- [x] Firestore rules deployed ✅
- [x] All components integrated into ReportBuilder.tsx ✅
- [ ] Development server running (`npm run dev`)
- [ ] Logged in as a valid user

## 🧪 Feature Testing

### 1. Onboarding Tour
**How to test:**
1. Navigate to `/reports` in browser
2. Tour should start automatically (if first-time)
3. Click through all 13 steps
4. Verify each step highlights the correct element

**To reset tour for testing:**
```javascript
// In browser console:
localStorage.removeItem('reportBuilderTourCompleted');
// Then refresh the page
```

**Expected behavior:**
- [ ] Tour starts automatically on first visit
- [ ] Tour highlights each section correctly
- [ ] All 13 steps display properly
- [ ] "Skip" button works
- [ ] Tour completion is stored in localStorage
- [ ] Tour doesn't show again after completion

---

### 2. Help Center
**How to test:**
1. Click "Help" button in header
2. Check all 4 tabs (Quick Start, FAQ, Glossary, Examples)
3. Try search functionality in FAQ
4. Click "Restart Tour" button

**Expected behavior:**
- [ ] Help button opens modal
- [ ] All 4 tabs are accessible
- [ ] Quick Start shows step-by-step guide
- [ ] FAQ section has 8 questions
- [ ] Search filters FAQ results
- [ ] Glossary shows field definitions
- [ ] Examples show 3 complete walkthroughs
- [ ] "Restart Tour" button resets and starts tour
- [ ] Close button (X) works

---

### 3. Template Library
**How to test:**
1. Click "Templates" button in header
2. Check "My Templates" tab (should be empty initially)
3. Check "Popular Templates" tab
4. Try search functionality

**Expected behavior:**
- [ ] Templates button opens modal
- [ ] "My Templates" tab shows empty state initially
- [ ] "Popular Templates" tab displays
- [ ] Search box filters templates
- [ ] Template cards show details (name, description, filters count, metrics count)
- [ ] "Use Template" button loads template
- [ ] Close button works

---

### 4. Intro Card
**How to test:**
1. Scroll to top of Report Builder
2. Check if intro card is visible
3. Click expand/collapse button

**Expected behavior:**
- [ ] Intro card displays below header
- [ ] Shows "How to Build a Custom Report"
- [ ] Has expandable sections
- [ ] "What You'll See" list displays
- [ ] "When to Use" text displays
- [ ] "Key Metrics Explained" section shows

---

### 5. Smart Field Selector (Filters)
**How to test:**
1. Click "Add Filter" button
2. Click on the Field selector
3. Try searching for a field
4. Toggle to "Advanced Mode"
5. Type a custom field name

**Expected behavior:**
- [ ] Dropdown shows common fields with icons (📅 💰 etc.)
- [ ] Fields are grouped by category
- [ ] Hover shows tooltip with field description
- [ ] Search filters the field list
- [ ] Advanced mode toggle works
- [ ] Can type custom field names in advanced mode
- [ ] Selected field shows info below selector

---

### 6. Smart Field Selector (Metrics)
**How to test:**
1. Click "Add Metric" button
2. Test field selector (same as filters)
3. Select different calculation types
4. Check format dropdown

**Expected behavior:**
- [ ] Field selector works same as in filters
- [ ] Calculation dropdown shows: Count, Sum, Average, Min, Max
- [ ] Format dropdown shows: Number, Currency, Percentage, Date
- [ ] Metric name input accepts text
- [ ] All fields update correctly

---

### 7. Tooltips
**How to test:**
1. Hover over question mark icons (?)
2. Check tooltips on:
   - Filters section header
   - Metrics section header
   - Calculation type label

**Expected behavior:**
- [ ] Tooltips appear on hover
- [ ] Show title, description, and examples
- [ ] Positioned correctly (not cut off)
- [ ] Disappear on mouse leave
- [ ] Readable text and good contrast

---

### 8. Live Preview
**How to test:**
1. Add at least one metric
2. Check if preview appears
3. Add/remove filters
4. Add/remove metrics
5. Try collapsing/expanding preview

**Expected behavior:**
- [ ] Preview shows when metrics exist
- [ ] Shows "first 5 rows" message
- [ ] Table displays with columns from metrics
- [ ] Sample data appears in rows
- [ ] Preview updates when filters change
- [ ] Preview updates when metrics change
- [ ] Loading spinner shows during refresh
- [ ] Can collapse/expand preview section
- [ ] Shows configuration summary

---

### 9. Save as Template
**How to test:**
1. Add some filters and metrics
2. Click "Save as Template" button
3. Fill in template name and description
4. Try saving as public/private
5. Add tags (comma-separated)

**Expected behavior:**
- [ ] Button is disabled when no metrics
- [ ] Button opens modal
- [ ] Template name field is required
- [ ] Description field is optional
- [ ] Public/private checkbox works
- [ ] Tags input accepts comma-separated values
- [ ] "Save" button works
- [ ] Success message appears
- [ ] Template appears in Template Library

---

### 10. Load Template
**How to test:**
1. Save a template (from test #9)
2. Click "Templates" button
3. Find your template in "My Templates"
4. Click "Use Template"

**Expected behavior:**
- [ ] Template appears in library
- [ ] Click "Use Template" closes modal
- [ ] Report name auto-fills
- [ ] Report type auto-selects
- [ ] Description auto-fills
- [ ] Filters populate correctly
- [ ] Metrics populate correctly

---

### 11. Report Generation
**How to test:**
1. Fill in report name
2. Select report type
3. Add at least one filter
4. Add at least one metric
5. Click "Create Report"

**Expected behavior:**
- [ ] Validation prevents submission without name
- [ ] Validation prevents submission without metrics
- [ ] Loading spinner shows during creation
- [ ] Success message appears
- [ ] Redirects to reports list after success
- [ ] Error message shows if creation fails

---

### 12. Field Schemas Per Report Type
**How to test:**
1. Select "Transfer Analytics" report type
2. Add filter → check available fields
3. Change to "Financial" report type
4. Add filter → check available fields
5. Repeat for all 7 report types

**Expected behavior:**
- [ ] Transfer Analytics shows transfer-specific fields
- [ ] Financial shows financial-specific fields
- [ ] Officer Performance shows officer-specific fields
- [ ] Deployment shows deployment-specific fields
- [ ] Branch Performance shows branch-specific fields
- [ ] Agent Performance shows agent-specific fields
- [ ] Applicant Status shows applicant-specific fields
- [ ] Common fields (createdAt, status) appear in all types

---

## 🔧 Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)

## 📱 Responsive Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)

## ♿ Accessibility Testing

- [ ] Keyboard navigation works (Tab through all elements)
- [ ] Screen reader support (test with NVDA or JAWS)
- [ ] All interactive elements have focus states
- [ ] Color contrast is sufficient
- [ ] Form labels are properly associated

## 🐛 Common Issues & Solutions

### Issue: "Tour not starting"
**Solution:**
```javascript
localStorage.removeItem('reportBuilderTourCompleted');
// Refresh page
```

### Issue: "Fields not showing in dropdown"
**Solution:**
- Check report type matches schema keys
- Verify `getFieldsForReportType(reportType)` returns data
- Console log `availableFields` to debug

### Issue: "Templates not saving"
**Solution:**
- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Verify user is authenticated
- Check browser console for errors
- Ensure `organizationId` exists in user token

### Issue: "Import errors for new components"
**Solution:**
```bash
# Reinstall dependencies
npm install

# Clear cache
rm -rf node_modules
npm install
```

### Issue: "Live Preview not updating"
**Solution:**
- Add at least one metric (preview requires metrics)
- Check console for errors
- Verify filters/metrics arrays are valid

### Issue: "Styles look broken"
**Solution:**
```bash
# Make sure Tailwind CSS is working
npm run dev

# Check driver.js CSS is imported in OnboardingTour.tsx
# Should have: import 'driver.js/dist/driver.css'
```

## 📊 Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Field selector dropdown opens instantly
- [ ] Live preview updates in < 1 second
- [ ] Template library loads in < 2 seconds
- [ ] No console errors
- [ ] No memory leaks (check DevTools Memory tab)

## 🔒 Security Testing

- [ ] Can only see own templates (unless public)
- [ ] Can only edit own templates
- [ ] Can't delete other users' templates
- [ ] Public templates visible to organization
- [ ] Private templates only visible to creator

## ✅ Final Checks

Before marking complete:
- [ ] All features work as expected
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code is clean and commented
- [ ] User experience is smooth
- [ ] Performance is acceptable
- [ ] Accessible via keyboard
- [ ] Responsive on all screen sizes

## 📝 Notes

**Date Tested**: ___________
**Tester**: ___________
**Environment**: Development / Staging / Production
**Browser/Version**: ___________

**Issues Found**:
1.
2.
3.

**Suggestions**:
1.
2.
3.

---

## 🎉 Success Criteria

The integration is successful if:
- ✅ All 12 features work correctly
- ✅ No blocking bugs
- ✅ User can complete a full report creation flow
- ✅ First-time users can use the builder without help
- ✅ Templates can be saved and loaded
- ✅ Help center answers common questions

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Complete | ⬜ Failed

---

**Last Updated**: January 11, 2025
**Next Review**: ___________
