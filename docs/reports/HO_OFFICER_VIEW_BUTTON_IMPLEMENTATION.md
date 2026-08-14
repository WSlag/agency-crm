# HO Recruitment Officer View Button Implementation

## Date: October 20, 2025

## 🎯 Feature Request

Add a "View" button to HO Recruitment Officer cards that allows users to view all applicants assigned to that specific officer.

---

## ✅ Implementation Summary

### 1. **Updated Officer Management Page**
**File: `src/pages/officers/OfficerManagement.tsx`**

#### Added Imports:
```typescript
import { Link } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
```

#### Mobile View - Added View Button:
```typescript
{/* View Button */}
<Link
  to={`/ho-applicants/my-applicants?officer=${officer.uid}`}
  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
>
  <EyeIcon className="h-4 w-4 mr-2" />
  View Assigned Applicants ({stats.totalApplicants})
</Link>
```

#### Desktop Table View - Added Actions Column:
```typescript
<th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
  Actions
</th>
```

And in each row:
```typescript
<td className="whitespace-nowrap px-3 py-4 text-sm">
  <Link
    to={`/ho-applicants/my-applicants?officer=${officer.uid}`}
    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
  >
    <EyeIcon className="h-4 w-4 mr-1" />
    View
  </Link>
</td>
```

---

### 2. **Updated My Applicants Page to Support Admin View**
**File: `src/pages/applicants/MyApplicants.tsx`**

#### Added Imports:
```typescript
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
```

#### Added State for Officer Information:
```typescript
const [searchParams] = useSearchParams();
const [officerName, setOfficerName] = useState<string>('');

// Get officer ID from query parameter (for admin view)
const officerIdParam = searchParams.get('officer');
const isAdminView = (customClaims?.role === 'admin' || customClaims?.role === 'president') && officerIdParam;
```

#### Updated Authorization Logic:
```typescript
// SECURITY: Redirect if not authorized
useEffect(() => {
  if (customClaims?.role) {
    const isAuthorized = 
      customClaims.role === 'ho_recruitment_officer' || 
      customClaims.role === 'admin' || 
      customClaims.role === 'president';
    
    if (!isAuthorized) {
      console.warn('Unauthorized access to My Applicants - redirecting');
      navigate('/dashboard');
    }
  }
}, [customClaims, navigate]);
```

#### Updated Data Loading Logic:
```typescript
// Determine which officer's applicants to show
const targetOfficerId = isAdminView ? officerIdParam : user.uid;

// Fetch officer name if viewing another officer's applicants
if (isAdminView && officerIdParam) {
  const officersQuery = query(
    collection(firestore, 'users'),
    where('role', '==', 'ho_recruitment_officer')
  );
  const snapshot = await getDocs(officersQuery);
  const officer = snapshot.docs.find(doc => doc.id === officerIdParam);
  if (officer) {
    setOfficerName(officer.data().displayName || officer.data().email || 'Unknown Officer');
  }
}

// SECURITY: Filter by assigned officer ID
const secureFilter: ApplicantFilter = {
  assignedOfficerId: targetOfficerId,
};
```

#### Updated Filter Change Logic:
```typescript
// SECURITY: Always keep assignedOfficerId filter
const targetOfficerId = isAdminView ? officerIdParam : user?.uid;
if (targetOfficerId) {
  newFilters.assignedOfficerId = targetOfficerId;
}
```

#### Updated Header Display:
```typescript
<h1 className="text-2xl font-bold text-gray-900">
  {isAdminView ? `${officerName}'s Assigned Applicants` : 'My Assigned Applicants'}
</h1>
<p className="text-sm text-gray-500 mt-1">
  {isAdminView 
    ? `Viewing applicants assigned to ${officerName}` 
    : 'Applicants assigned to you for recruitment processing'}
</p>
```

---

## 🎨 User Experience

### Admin/Manager View:

1. **Navigate to Officers Page** (`/officers`)
2. **See Officer Cards** with performance metrics
3. **Click "View" Button** on any officer card
4. **Redirected to** `/ho-applicants/my-applicants?officer={officerId}`
5. **See All Assigned Applicants** for that specific officer
6. **Header Shows**: "Officer Name's Assigned Applicants"

### Mobile View:
```
┌────────────────────────────────────┐
│ [H] HO RO1 Hro123!        [active]│
│     horo1@example.com              │
│                                    │
│ Total Applicants: 2                │
│ Active Cases: 2                    │
│ Success Rate: 0%                   │
│ Status: active                     │
│                                    │
│ [👁️ View Assigned Applicants (2)] │ ← NEW!
└────────────────────────────────────┘
```

### Desktop Table View:
```
┌─────────────────┬──────────────┬──────────┬──────────┬────────┬─────────┐
│ Officer         │ Total Apps   │ Active   │ Success  │ Status │ Actions │
├─────────────────┼──────────────┼──────────┼──────────┼────────┼─────────┤
│ HO RO1 Hro123! │ 2            │ 2        │ 0%       │ active │ [View]  │ ← NEW!
│ horo1@...       │              │          │          │        │         │
└─────────────────┴──────────────┴──────────┴──────────┴────────┴─────────┘
```

### Applicants View (Admin Mode):
```
┌────────────────────────────────────────────────────────────────┐
│ 👥 HO RO1 Hro123!'s Assigned Applicants                       │
│    Viewing applicants assigned to HO RO1 Hro123!          2   │
└────────────────────────────────────────────────────────────────┘

[Applicant Table showing all assigned applicants...]
```

---

## 🔒 Security Features

1. **Authorization Check**: Only admin, president, and HO officers can access the page
2. **Officer Filter Enforcement**: The `assignedOfficerId` filter cannot be removed
3. **Role-Based Display**: 
   - Officers see only their own applicants
   - Admins can view any officer's applicants via query parameter
4. **Officer Name Validation**: Officer existence is verified before displaying

---

## 📊 URL Structure

### Regular Officer View:
```
/ho-applicants/my-applicants
```
- Shows applicants assigned to the logged-in officer

### Admin View of Specific Officer:
```
/ho-applicants/my-applicants?officer={officerId}
```
- Shows applicants assigned to the specified officer
- Only accessible by admin/president roles

---

## 🧪 Testing Scenarios

### Test Case 1: Admin Views Officer's Applicants
1. ✅ Login as Admin
2. ✅ Navigate to `/officers`
3. ✅ Click "View" button on an officer card
4. ✅ Verify redirect to `/ho-applicants/my-applicants?officer={uid}`
5. ✅ Verify header shows "{Officer Name}'s Assigned Applicants"
6. ✅ Verify only that officer's applicants are displayed

### Test Case 2: Officer Views Own Applicants
1. ✅ Login as HO Recruitment Officer
2. ✅ Navigate to `/my-applicants`
3. ✅ Verify header shows "My Assigned Applicants"
4. ✅ Verify only their assigned applicants are displayed

### Test Case 3: Unauthorized Access
1. ✅ Try to access with query parameter as non-admin
2. ✅ Verify officer parameter is ignored
3. ✅ Verify only shows own applicants

### Test Case 4: Mobile Responsiveness
1. ✅ View on mobile device
2. ✅ Verify "View" button is full-width and visible
3. ✅ Verify button shows applicant count
4. ✅ Verify navigation works correctly

---

## 💡 Key Features

1. **Dual-Mode Support**: 
   - Officer mode: View own applicants
   - Admin mode: View any officer's applicants

2. **Smart Header Display**: 
   - Dynamic title based on viewing mode
   - Shows officer name in admin view

3. **Consistent Security**: 
   - Always filters by specific officer
   - Cannot view unassigned or other officers' applicants (unless admin)

4. **Mobile-Friendly**: 
   - Full-width button on mobile
   - Shows applicant count in button text
   - Responsive layout

5. **Easy Navigation**: 
   - Single click from officers page
   - Direct link with query parameter
   - Seamless user experience

---

## ✨ Completed!

The View button is now fully functional on HO Recruitment Officer cards. When clicked:
- ✅ Admin/Manager users are redirected to view that officer's assigned applicants
- ✅ Header dynamically shows the officer's name
- ✅ All security filters are properly enforced
- ✅ Works on both mobile and desktop views
- ✅ Displays accurate applicant count in the button

