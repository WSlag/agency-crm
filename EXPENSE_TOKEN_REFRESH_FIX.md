# Expense Permission Error - Token Refresh Required

## Root Cause Identified
The custom claims ARE set correctly in Firebase Auth:
- **User**: `cotbranch@agency.com` (Cotabato Branch Manager)
- **Role**: `branch_manager`
- **Branch ID**: `GW9kiODw1qR4zezHQwag`

However, the authentication token in the browser is **stale** and doesn't include the updated custom claims.

## The Solution: Force Token Refresh

### Option 1: Sign Out and Sign Back In (EASIEST)
1. Click the **Sign Out** button in the app
2. Sign back in with the same credentials
3. This will generate a new token with the latest custom claims
4. Try submitting the expense again

### Option 2: Clear Browser Storage (IF SIGN OUT DOESN'T WORK)
1. Open **Developer Tools** (F12)
2. Go to **Application** tab
3. Under **Storage**:
   - Click **Clear site data**
   - OR manually clear:
     - Local Storage
     - Session Storage
     - IndexedDB
4. **Refresh the page** (F5)
5. Sign back in
6. Try submitting the expense again

### Option 3: Use Incognito/Private Window (QUICK TEST)
1. Open a **new incognito/private browser window**
2. Navigate to `localhost:3000`
3. Sign in as Branch Manager
4. Try creating an expense
5. This will use a fresh authentication token

## Why This Happens

### Authentication Token Lifecycle
1. When you sign in, Firebase Auth creates an **authentication token** (JWT)
2. This token includes **custom claims** (role, branchId)
3. The token is **cached** in the browser for 1 hour
4. Firestore rules check this token to validate permissions

### The Problem
If custom claims are **updated after sign-in**, the cached token still has the **old claims**:
- Old token: `{ role: null, branchId: null }` ❌
- New claims in Firebase: `{ role: "branch_manager", branchId: "GW..." }` ✅
- Firestore sees the old token and denies permission

### The Fix
Signing out and back in generates a **new token** with the latest custom claims.

## Verification Steps

### After Signing Out and Back In:

1. Open **Console** (F12)
2. Try to create an expense
3. You should now see the diagnostic log:
   ```
   🔐 Authentication Check: {
     userId: "...",
     email: "cotbranch@agency.com",
     customClaims: {
       role: "branch_manager",
       branchId: "GW9kiODw1qR4zezHQwag"
     },
     role: "branch_manager",  ✅
     branchId: "GW9kiODw1qR4zezHQwag"  ✅
   }
   ```

4. The expense should be created successfully ✅
5. The receipt should be uploaded ✅
6. Notifications should be sent ✅

## Alternative: Automatic Token Refresh

If this keeps happening, we can add automatic token refresh logic. The diagnostic code I added already does this:

```typescript
const tokenResult = await currentUser.getIdTokenResult(true); // ← Force refresh
```

But this only refreshes **within the app**. If the token is cached at a lower level, sign out/sign in is required.

## Testing After Fix

### Test 1: Office Expenses with Receipt
1. Sign out and sign back in
2. Go to **Expenses** > **New Expense**
3. Select **Office Expenses**
4. Fill in form and upload receipt
5. Click **Create**
6. ✅ Should work!

### Test 2: Medical Expenses with Applicant and Receipt  
1. Select **Medical** (requires applicant)
2. Choose an applicant
3. Upload receipt
4. Click **Create**
5. ✅ Should work!

## Status
✅ **ROOT CAUSE IDENTIFIED** - Stale authentication token
✅ **SOLUTION PROVIDED** - Sign out and sign back in
⏳ **AWAITING TEST** - Please try signing out and back in

## Files Status
- ✅ Custom claims are set correctly in Firebase Auth
- ✅ Firestore rules are simplified (deployed)
- ✅ Diagnostic logging added to code
- ✅ All previous fixes applied (receipt validation, applicantId null, etc.)

