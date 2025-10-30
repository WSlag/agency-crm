# Adding Sample Resume Data for Testing

This guide will help you add sample resume data to test the Employer Portal landing page.

## Quick Start

### Option 1: Using the Admin Panel (Recommended)

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Log in as an admin user** at:
   ```
   http://localhost:3000/login
   ```

3. **Navigate to the sample data page**:
   ```
   http://localhost:3000/admin/add-sample-data
   ```

4. **Click the "Add Sample Resumes" button**
   - This will add 3 sample applicants to your Firestore database
   - All resumes will have `resumeVisible: true` and `medicalStatus: passed`

5. **View the results** on the Employer Portal:
   ```
   http://localhost:3000/
   ```

---

## Sample Resumes Included

The utility adds 3 diverse sample applicants:

### 1. **Maria Santos** - Domestic Helper
- **Age:** 29
- **Gender:** Female
- **Destination:** Hong Kong
- **Position:** Domestic Helper
- **Experience:** 6 years overseas (Hong Kong, Singapore)
- **Skills:** Child Care, Elderly Care, Cooking, Housekeeping, First Aid
- **Certifications:** TESDA Caregiving NC II, BLS
- **Languages:** Tagalog (Native), English (Fluent), Cantonese (Basic)

### 2. **John Dela Cruz** - Construction Worker
- **Age:** 34
- **Gender:** Male
- **Destination:** Saudi Arabia
- **Position:** Construction Worker / Electrician
- **Experience:** 9 years overseas (Saudi Arabia, UAE)
- **Skills:** Electrical Wiring, Equipment Installation, Safety Protocols
- **Certifications:** TESDA Electrical Installation NC II, OSH Training
- **Languages:** Tagalog (Native), English (Fluent), Arabic (Intermediate)

### 3. **Ana Marie Reyes** - Registered Nurse
- **Age:** 36
- **Gender:** Female
- **Destination:** UK
- **Position:** Registered Nurse
- **Experience:** 7 years overseas (London, UK)
- **Skills:** Patient Care, IV Administration, Wound Care, CPR/BLS
- **Certifications:** RN License (PH & UK), BLS, ACLS, PALS
- **Languages:** Tagalog (Native), English (Fluent)

---

## What Gets Added to Firestore

Each sample applicant document includes:

```javascript
{
  // Personal Information
  fullName: string,
  dateOfBirth: Timestamp,
  nationality: "Filipino",
  gender: "male" | "female",
  civilStatus: "single" | "married",

  // Job Information
  positionApplied: string,
  countryDestination: string,
  preferredCountries: string[],
  preferredPositions: string[],

  // Education & Experience
  education: Array<{...}>,
  workExperience: Array<{...}>,
  skills: string[],
  certifications: string[],
  languages: Array<{...}>,

  // Medical Status
  medicalStatus: {
    examination: {
      result: "passed",  // ✓ Required for public visibility
      date: Timestamp,
      facility: string
    },
    vaccinations: Array<{...}>
  },

  // Visibility Settings
  resumeVisible: true,  // ✓ Makes resume visible on public portal
  status: "active",      // ✓ Active applicants only
  photoUrl: string,      // Sample Unsplash photos

  // Other Required Fields
  branchId: "HO",
  currentStage: "medical",
  applicationType: "direct_hire",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Option 2: Using Browser Console (Alternative)

If you prefer to use the browser console:

1. Open your browser's Developer Tools (F12)
2. Navigate to the Console tab
3. Type the following and press Enter:

```javascript
// Import and run the function
import('./src/utils/addSampleData.ts').then(module => {
  module.addSampleResumes().then(() => {
    console.log('Sample data added! Refresh the page to see results.');
  });
});
```

---

## Testing the Landing Page

After adding sample data:

1. **Navigate to the root URL**:
   ```
   http://localhost:3000/
   ```

2. **You should see:**
   - The Employer Portal landing page
   - 3 sample worker cards in the "Featured Workers" section
   - All 3 resumes in the "Search Available Workers" section at the bottom

3. **Test the search and filter features:**
   - Search by name: Try "Maria", "John", or "Ana"
   - Filter by country: Select "Hong Kong", "Saudi Arabia", or "UK"
   - Filter by position: Select "Domestic Helper", "Construction Worker", or "Registered Nurse"
   - Filter by gender: Male or Female
   - Sort by: Name, Age, Experience, Date

4. **Click on a worker card** to:
   - View detailed resume modal
   - See work experience
   - View skills and certifications
   - Express interest or contact agency

---

## Requirements for Public Resume Visibility

For a resume to appear on the Employer Portal, the applicant must have:

1. ✅ `resumeVisible: true`
2. ✅ `medicalStatus.examination.result: "passed"`
3. ✅ `status: "active"`

All sample data meets these requirements.

---

## Troubleshooting

### Issue: "No Workers Found" on Landing Page

**Possible causes:**
1. Sample data not added to Firestore yet
2. Firebase configuration issue
3. Firestore security rules blocking read access

**Solution:**
1. Check Firestore console to verify data was added
2. Verify `.env.development` has correct Firebase credentials
3. Check browser console for errors

### Issue: Can't Access Admin Page

**Possible causes:**
1. Not logged in as admin user
2. User doesn't have `admin` role

**Solution:**
1. Log in at `/login` with admin credentials
2. Verify user's custom claims include `role: "admin"`

### Issue: Images Not Loading

**Possible causes:**
1. Network issue loading Unsplash images
2. Ad blocker blocking external images

**Solution:**
1. Check network tab in browser dev tools
2. Temporarily disable ad blocker
3. Replace `photoUrl` with your own images if needed

---

## Cleanup

To remove sample data from Firestore:

1. Open Firebase Console
2. Navigate to Firestore Database
3. Find the `applicants` collection
4. Delete sample documents by name:
   - Maria Santos
   - John Dela Cruz
   - Ana Marie Reyes

---

## Next Steps

After testing with sample data:

1. **Customize Agency Info**: Navigate to `/admin/agency-info` to update:
   - Agency name
   - Logo
   - Contact information
   - Tagline

2. **Manage Resume Visibility**: Navigate to `/admin/resume-management` to:
   - Toggle resume visibility for real applicants
   - Control which resumes appear publicly

3. **View Employer Inquiries**: Navigate to `/admin/employer-inquiries` to:
   - See employer inquiries from the landing page
   - Contact interested employers

---

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify Firebase connection
3. Ensure you're logged in as admin
4. Check Firestore security rules

Happy testing! 🎉
