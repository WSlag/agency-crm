# Employer Details Feature - User Guide

## Overview

The Employer Details feature allows HO Recruitment Officers to record employer information when an applicant has been selected by an employer. This information is required before the applicant can be advanced to the Deployed stage.

---

## When Does This Feature Appear?

The "Employer Details" tab appears in the applicant profile when:
- The applicant reaches the **SELECTED** stage
- The applicant has been **DEPLOYED** (for viewing/editing)

---

## Who Can View/Edit Employer Details?

**Authorized Users:**
- ✅ **Admin** - Full access
- ✅ **President** - Full access
- ✅ **Assigned HO Recruitment Officer** - Full access (only for applicants assigned to them)

**Unauthorized Users:**
- ❌ **Branch Manager** - Cannot view
- ❌ **HO Accountant** - Cannot view (read-only system access)
- ❌ **Unassigned HO Officers** - Cannot view (only assigned officer can access)

---

## Required Fields

All 4 fields must be filled before the applicant can be advanced to Deployed:

1. **FRA Name** (Foreign Recruitment Agency)
   - The name of the recruitment agency that placed the applicant
   - Example: "Global Manpower Services Inc."

2. **Employer Name**
   - The name of the company/employer hiring the applicant
   - Example: "ABC Manufacturing Co. Ltd."

3. **Employer Address**
   - Full address of the employer
   - Example: "123 Industrial Park, Guangzhou, China"

4. **Employer Contact Number**
   - Phone number to contact the employer
   - Example: "+86-20-1234-5678"

---

## How to Add Employer Details

### Step 1: Navigate to Applicant Profile
1. Go to the applicant's profile page
2. Ensure the applicant is at SELECTED stage

### Step 2: Access Employer Details Tab
1. Click on the **"Employer Details"** tab
2. You should see an empty state with "No employer details" message

### Step 3: Click "Add Employer Details"
1. Click the **"Add Employer Details"** button
2. The form will appear with 4 fields

### Step 4: Fill in All Required Fields
1. **FRA Name**: Enter the Foreign Recruitment Agency name
2. **Employer Name**: Enter the employer/company name
3. **Employer Address**: Enter the full employer address
4. **Employer Contact Number**: Enter the contact number

### Step 5: Save the Details
1. Click **"Save Details"** button
2. Wait for confirmation
3. The page will refresh showing the saved information

---

## How to Edit Employer Details

1. Navigate to the applicant's Employer Details tab
2. Click the **"Edit Details"** button in the top-right
3. Modify the fields as needed
4. Click **"Save Details"** to save changes
5. Or click **"Cancel"** to discard changes

---

## Validation Rules

### When Adding/Editing:
- ✅ All 4 fields must be filled
- ✅ No fields can be empty
- ❌ If any field is empty, you'll see an error: "All fields are required"

### When Advancing to Deployed Stage:
- ✅ All employer details must be complete
- ❌ If details are incomplete, you'll see an error:  
  *"Employer details are incomplete. Please fill in all employer information (FRA Name, Employer Name, Address, and Contact Number) before advancing."*

---

## Workflow Example

### Scenario: Moving Applicant from Processing to Deployed

**Step 1: Advance to SELECTED Stage**
1. Applicant is at PROCESSING stage
2. HO Officer uploads Employment Contract
3. Admin/President approves advancement to SELECTED stage
4. ✅ Applicant now at SELECTED stage

**Step 2: Add Employer Details**
1. "Employer Details" tab appears in applicant profile
2. HO Officer clicks "Add Employer Details"
3. Fills in all 4 required fields:
   - FRA Name: "Pacific Overseas Employment Agency"
   - Employer Name: "Samsung Electronics"
   - Employer Address: "Seoul, South Korea"
   - Employer Contact Number: "+82-2-1234-5678"
4. Clicks "Save Details"
5. ✅ Employer details saved successfully

**Step 3: Upload Deployment Documents**
1. HO Officer uploads PDOS certificate (or Plane Ticket)
2. ✅ Document requirements met

**Step 4: Request Advancement to DEPLOYED**
1. HO Officer clicks "Advance to Next Stage"
2. System checks:
   - ✅ Employment Contract uploaded
   - ✅ Employer details complete
   - ✅ PDOS or Plane Ticket uploaded
3. Request submitted for approval
4. Admin/President approves
5. ✅ Applicant moved to DEPLOYED stage
6. 💰 Second commission (50%) triggered

---

## Error Messages and Solutions

### Error: "All fields are required"
**Cause:** One or more fields are empty when saving  
**Solution:** Fill in all 4 fields before clicking Save Details

### Error: "Employer details are incomplete..."
**Cause:** Trying to advance from SELECTED stage without complete employer details  
**Solution:** 
1. Go to Employer Details tab
2. Add/complete all employer information
3. Try advancing again

### Error: "You do not have permission to view employer details"
**Cause:** User doesn't have access rights  
**Solution:** 
- If you're the assigned HO Officer, contact Admin
- If you're another HO Officer, this applicant is not assigned to you
- If you're a Branch Manager, employer details are only visible to HO staff

---

## Tips and Best Practices

### 1. Add Details Early
- Add employer details as soon as the applicant is selected
- Don't wait until deployment documents are ready
- This prevents delays in the advancement process

### 2. Verify Information
- Double-check employer contact information
- Ensure addresses are complete and accurate
- Verify FRA name matches official records

### 3. Update When Needed
- If employer details change, update them immediately
- Click Edit, make changes, and Save
- Changes are tracked with timestamp

### 4. Use Complete Information
- Don't use abbreviations unless necessary
- Include country codes for international phone numbers
- Provide full addresses including country

---

## Frequently Asked Questions

### Q: Can I skip employer details and come back later?
**A:** Yes, you can leave the SELECTED stage without filling employer details. However, you MUST complete them before advancing to DEPLOYED.

### Q: Can I change employer details after deployment?
**A:** Yes, authorized users can edit employer details even after the applicant is deployed.

### Q: Why can't Branch Managers see employer details?
**A:** Employer details are Head Office information managed after the applicant is transferred to HO. Branch staff don't need access to this information.

### Q: What happens if the employer changes?
**A:** Simply edit the employer details with the new information. The system tracks who made the last update and when.

### Q: Can I export employer details for reports?
**A:** Employer details are part of the applicant record and will be included in applicant reports and exports.

---

## Technical Notes

### Data Storage
- Employer details are stored in the `employerDetails` field of the applicant document
- Field includes metadata: `addedBy` (user ID) and `addedAt` (timestamp)
- Field is optional in the database for backward compatibility

### Access Control
- Implemented at both frontend (component level) and backend (Firestore rules)
- Unauthorized users receive "Access Denied" message
- HO Officers can only access details for assigned applicants

### Validation
- Frontend validation prevents saving incomplete data
- Backend validation prevents stage advancement without complete details
- Error messages are clear and actionable

---

## Support

If you encounter issues with the Employer Details feature:
1. Check you have the correct role and permissions
2. Verify the applicant is at the correct stage (SELECTED or DEPLOYED)
3. Ensure all 4 fields are properly filled
4. Contact system administrator if problems persist

---

**Last Updated:** October 20, 2025  
**Feature Status:** ✅ Active and Ready to Use

