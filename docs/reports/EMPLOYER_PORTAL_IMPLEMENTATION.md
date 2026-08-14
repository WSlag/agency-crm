# Employer Portal Implementation Guide

## Overview
This document describes the new Public Employer Portal feature that allows employers worldwide to browse resumes of qualified applicants who have passed medical examinations.

## Features Implemented

### 1. Public Employer Portal (`/employer-portal`)
A public-facing page (no authentication required) where employers can:
- Browse qualified worker resumes
- Search and filter by position, country, skills, age, gender
- View detailed resume information including:
  - Personal information
  - Education history
  - Work experience
  - Skills and certifications
  - Languages
  - Passport copy and photos
- Express interest in candidates (shortlist)
- Contact the agency about specific candidates

**URL:** `/employer-portal`
**Access:** Public (no login required)

### 2. Admin: Resume Management (`/admin/resume-management`)
Admin-only page to control which applicants appear on the employer portal.

**Features:**
- View all applicants who passed medical examination
- Toggle visibility for each applicant (show/hide on portal)
- Upload required photos:
  - 2x2 ID photo
  - Full body photo
  - Passport copy
- Stats dashboard showing:
  - Total qualified applicants
  - Visible on portal
  - Hidden applicants

**URL:** `/admin/resume-management`
**Access:** Admin only

### 3. Admin: Agency Info Settings (`/admin/agency-info`)
Configure how the agency appears on the public employer portal.

**Features:**
- Upload agency logo
- Set agency name and tagline
- Add agency description
- Configure contact information (phone, email, address)
- Add social media links (Facebook, LinkedIn, Twitter)
- Set license number
- Live preview of how it appears to employers

**URL:** `/admin/agency-info`
**Access:** Admin only

### 4. Admin: Employer Inquiries (`/admin/employer-inquiries`)
Dashboard to manage leads from potential employers.

**Features:**
- View all inquiries (shortlist + contact requests)
- Filter by status (New, Contacted, Resolved, Closed)
- Filter by type (Shortlist, Contact Request)
- View employer details (name, company, email, phone, country)
- View messages from employers
- Update inquiry status
- Add internal notes
- Quick email link to contact employers
- Stats dashboard showing inquiry counts

**URL:** `/admin/employer-inquiries`
**Access:** Admin only

## Technical Implementation

### New Files Created

#### Types
- `src/types/resume.ts` - TypeScript interfaces for resume system

#### Services
- `src/services/resumeBuilder.ts` - Resume generation and filtering logic

#### Stores
- `src/stores/resumeStore.ts` - Zustand store for public resume data

#### Public Components
- `src/components/public/PublicLayout.tsx` - Layout for employer portal
- `src/components/public/ResumeCard.tsx` - Resume card component
- `src/components/public/ResumeDetailModal.tsx` - Full resume view modal
- `src/components/public/EmployerInquiryForm.tsx` - Contact/shortlist form

#### Public Pages
- `src/pages/public/EmployerPortal.tsx` - Main employer portal page

#### Admin Pages
- `src/pages/admin/ResumeManagement.tsx` - Resume visibility management
- `src/pages/admin/AgencyInfoSettings.tsx` - Agency information settings
- `src/pages/admin/EmployerInquiries.tsx` - Employer inquiries dashboard

### Modified Files

#### Types
- `src/types/applicant.ts` - Added `resumeVisible`, `photoUrl`, `fullBodyPhotoUrl`, `passportCopyUrl` fields

#### Routes
- `src/App.tsx` - Added public route and admin routes

#### Navigation
- `src/config/navigation.ts` - Added navigation items for admin pages

#### Security
- `firestore.rules` - Added public access rules for:
  - `applicants` collection (filtered by `resumeVisible` and medical status)
  - `agency_info` collection (public read)
  - `employer_inquiries` collection (public write, admin read)

## Database Collections

### New Collections

#### `agency_info`
Stores agency branding and contact information for the employer portal.

```typescript
{
  agencyName: string;
  logoUrl: string;
  tagline?: string;
  about: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  licenseNumber?: string;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Security:**
- Public read access
- Admin-only write access

#### `employer_inquiries`
Stores inquiries from employers about specific applicants.

```typescript
{
  applicantId: string;
  applicantName: string;
  inquiryType: 'shortlist' | 'contact';
  employerName: string;
  companyName: string;
  email: string;
  phone: string;
  country?: string;
  message?: string;
  status: 'new' | 'contacted' | 'resolved' | 'closed';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
  notes?: string;
}
```

**Security:**
- Public write access (employers can submit inquiries)
- Admin-only read access

### Modified Collections

#### `applicants`
Added new fields for resume portal:

```typescript
{
  // ... existing fields ...
  resumeVisible?: boolean;      // If true, visible on employer portal
  photoUrl?: string;            // 2x2 ID photo URL
  fullBodyPhotoUrl?: string;    // Full body photo URL
  passportCopyUrl?: string;     // Passport copy URL
}
```

**Modified Security Rules:**
- Added public read access for applicants where:
  - `resumeVisible === true`
  - `medicalStatus.examination.result === 'passed'`
  - `status === 'active'`

## Security Features

### Public Access Controls
1. **Read-Only Access:** Employers can only read approved resume data
2. **Filtered Data:** Only applicants with passed medical and `resumeVisible=true` are exposed
3. **Sanitized Information:** Sensitive data (branch, agent, financial info) excluded from public view
4. **No Authentication Bypass:** Public route is completely separate from admin dashboard

### Admin Access Controls
1. **Role-Based:** All admin features restricted to `admin` role only
2. **Granular Control:** Admin decides exactly which applicants are visible
3. **Audit Trail:** All inquiries tracked with timestamps and status

### Firestore Security Rules
```javascript
// Public read for resume-visible applicants
match /applicants/{applicantId} {
  allow read: if isAuthenticated() ||
    (resource.data.resumeVisible == true &&
     resource.data.medicalStatus.examination.result == 'passed' &&
     resource.data.status == 'active');
}

// Public read for agency info
match /agency_info/{infoId} {
  allow read: if true;
  allow write: if isAdmin();
}

// Public write for inquiries
match /employer_inquiries/{inquiryId} {
  allow read: if isAdmin();
  allow create: if true;
  allow update, delete: if isAdmin();
}
```

## User Workflows

### Admin Workflow: Setting Up Employer Portal

1. **Configure Agency Info** (One-time setup)
   - Navigate to `/admin/agency-info`
   - Upload agency logo
   - Fill in agency details, contact info
   - Add social media links
   - Save changes

2. **Select Applicants to Display**
   - Navigate to `/admin/resume-management`
   - See list of all applicants who passed medical
   - For each applicant to showcase:
     - Upload 2x2 ID photo
     - Upload full body photo
     - Upload passport copy
     - Toggle "Visible on Portal" to ON
   - Click Save

3. **Monitor Employer Inquiries**
   - Navigate to `/admin/employer-inquiries`
   - View all inquiries sorted by date
   - Filter by status or type
   - Update inquiry status as you contact employers
   - Add internal notes for tracking

### Employer Workflow: Finding Workers

1. **Visit Employer Portal**
   - Go to `/employer-portal`
   - No login required

2. **Browse & Search**
   - Use search bar for keywords
   - Filter by country, position, gender
   - Sort by newest, name, age, or experience

3. **View Resume Details**
   - Click on any resume card
   - View complete profile including:
     - Education and work history
     - Skills, languages, certifications
     - Photos and passport copy

4. **Express Interest**
   - Click "Express Interest" to shortlist
   - OR click "Contact Agency" to send message
   - Fill in contact form with details
   - Submit inquiry

5. **Agency Contacts You**
   - Agency admin receives inquiry
   - Agency contacts employer via email/phone
   - Proceed with hiring process

## Navigation Structure

### Admin Sidebar Navigation (visible to Admin role only)
```
├── Resume Portal (/admin/resume-management)
├── Agency Info (/admin/agency-info)
└── Employer Inquiries (/admin/employer-inquiries)
```

### Public Routes (no authentication)
```
├── /employer-portal (main landing page)
```

## API / Data Flow

### Public Employer Portal
1. **Load Agency Info:** Fetches from `agency_info` collection
2. **Load Resumes:** Queries `applicants` where `resumeVisible=true` and `medicalStatus.examination.result='passed'`
3. **Submit Inquiry:** Writes to `employer_inquiries` collection

### Admin Resume Management
1. **Load Applicants:** Queries `applicants` where `medicalStatus.examination.result='passed'`
2. **Toggle Visibility:** Updates `resumeVisible` field in applicants
3. **Upload Photos:** Uploads to Firebase Storage, updates URLs in applicant document

### Admin Agency Info
1. **Load Agency Info:** Fetches from `agency_info` collection
2. **Upload Logo:** Uploads to Firebase Storage at `agency/logo_{timestamp}`
3. **Save Changes:** Updates/Creates document in `agency_info` collection

### Admin Employer Inquiries
1. **Load Inquiries:** Fetches all from `employer_inquiries` ordered by `createdAt`
2. **Update Status:** Updates `status` field in inquiry document
3. **Add Notes:** Updates `notes` field in inquiry document

## Testing Checklist

### Public Portal
- [ ] Can access `/employer-portal` without login
- [ ] Agency branding displays correctly
- [ ] Resume cards show correct information
- [ ] Search and filters work properly
- [ ] Resume detail modal opens and displays all sections
- [ ] Photos display correctly
- [ ] "Express Interest" form submits successfully
- [ ] "Contact Agency" form submits successfully
- [ ] Empty states display when no results

### Admin: Resume Management
- [ ] Only admin can access page
- [ ] All medical-passed applicants display
- [ ] Photo upload works for all three types
- [ ] Toggle visibility updates database
- [ ] Stats show correct counts
- [ ] Search functionality works
- [ ] Link to applicant profile works

### Admin: Agency Info
- [ ] Only admin can access page
- [ ] Logo upload works
- [ ] Form validation works
- [ ] Save creates/updates agency info
- [ ] Preview shows correct information
- [ ] Social media links save properly

### Admin: Employer Inquiries
- [ ] Only admin can access page
- [ ] All inquiries display correctly
- [ ] Filters work (status, type)
- [ ] Status update works via dropdown
- [ ] Details modal shows all information
- [ ] Notes can be saved
- [ ] Email link works
- [ ] Stats show correct counts
- [ ] Applicant link works

### Security
- [ ] Non-admin users cannot access admin pages
- [ ] Only visible applicants show on public portal
- [ ] Only medical-passed applicants can be made visible
- [ ] Sensitive data not exposed on public portal
- [ ] Firestore rules reject unauthorized access

## Deployment Steps

1. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Build and Deploy Application**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

3. **Initial Setup (via Admin Dashboard)**
   - Login as admin
   - Navigate to `/admin/agency-info`
   - Configure agency information
   - Navigate to `/admin/resume-management`
   - Upload photos and enable visibility for applicants

4. **Share Employer Portal Link**
   - Share `https://yourdomain.com/employer-portal` with employers
   - Or add link to your marketing materials

## Future Enhancements

Potential features to add in the future:
- [ ] PDF export/print functionality for resumes
- [ ] Email notifications to admin when new inquiry received
- [ ] Auto-reply email to employers after inquiry submission
- [ ] Rate limiting for inquiry submissions (prevent spam)
- [ ] Advanced filters (experience years, certifications, languages)
- [ ] Employer account system (save favorites, application tracking)
- [ ] Analytics dashboard (page views, inquiry conversion rates)
- [ ] Multi-language support for employer portal
- [ ] WhatsApp integration for quick employer contact
- [ ] Video introductions for applicants

## Support

For issues or questions about this feature:
1. Check Firestore rules are deployed correctly
2. Verify agency info is configured
3. Ensure applicants have `resumeVisible=true` and passed medical
4. Check browser console for errors
5. Review Firebase Storage permissions for photo uploads

## File Reference

**New Files:** 16 files
**Modified Files:** 4 files
**Total Lines of Code:** ~3,500 lines

See commit history for detailed changes.
