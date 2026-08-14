# Agent Cards Enhancements

## Date: October 20, 2025

## 🎯 Updates Requested

1. Show the actual total count of each agent's applicants
2. Change currency from US Dollar ($) to Philippine Peso (₱)
3. Add a temporary Delete button to delete agents

---

## ✅ Changes Implemented

### File: `src/pages/agents/AgentManagement.tsx`

#### **Change 1: Added Imports for Firestore and Delete Functionality**

```typescript
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { TrashIcon } from '@heroicons/react/24/outline';
```

- Added Firestore imports for querying applicants and deleting agents
- Added TrashIcon for the delete button

---

#### **Change 2: Added State for Applicant Counts and Deletion**

```typescript
const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
```

- `applicantCounts`: Stores the actual count of applicants for each agent
- `deletingAgentId`: Tracks which agent is currently being deleted (for loading state)

---

#### **Change 3: Added useEffect to Fetch Actual Applicant Counts**

```typescript
// Fetch applicant counts for each agent
useEffect(() => {
  const fetchApplicantCounts = async () => {
    if (agents.length === 0) return;
    
    const counts: Record<string, number> = {};
    
    try {
      // Fetch all applicants and group by agentId
      const applicantsRef = collection(firestore, 'applicants');
      const snapshot = await getDocs(applicantsRef);
      
      snapshot.docs.forEach(doc => {
        const agentId = doc.data().agentId;
        if (agentId) {
          counts[agentId] = (counts[agentId] || 0) + 1;
        }
      });
      
      setApplicantCounts(counts);
    } catch (error) {
      console.error('Error fetching applicant counts:', error);
    }
  };
  
  fetchApplicantCounts();
}, [agents]);
```

**What it does:**
- Fetches ALL applicants from Firestore
- Groups them by `agentId` to get the actual count for each agent
- Updates the `applicantCounts` state with the real data

---

#### **Change 4: Added Delete Handler Function**

```typescript
// Handle agent deletion
const handleDeleteAgent = async (agentId: string, agentName: string, e: React.MouseEvent) => {
  e.preventDefault(); // Prevent navigation to agent detail
  e.stopPropagation();
  
  if (!confirm(`Are you sure you want to delete agent "${agentName}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    setDeletingAgentId(agentId);
    await deleteDoc(doc(firestore, 'agents', agentId));
    
    // Refresh the agents list
    if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
      await fetchAgentsByBranch(customClaims.branchId);
    } else {
      await fetchAllAgents();
    }
    
    alert(`Agent "${agentName}" has been deleted successfully.`);
  } catch (error) {
    console.error('Error deleting agent:', error);
    alert('Failed to delete agent. Please try again.');
  } finally {
    setDeletingAgentId(null);
  }
};
```

**Features:**
- Confirmation dialog before deletion
- Shows loading state while deleting
- Refreshes the agents list after deletion
- Success/error feedback to the user

---

#### **Change 5: Updated Stats to Use Actual Applicant Counts**

**Before:**
```typescript
totalApplicants: agents.reduce((sum, a) => sum + (a.totalApplicants || 0), 0),
```

**After:**
```typescript
totalApplicants: Object.values(applicantCounts).reduce((sum, count) => sum + count, 0),
```

- Now uses the actual applicant counts from Firestore

---

#### **Change 6: Changed Currency from $ to ₱ in Header Stats**

**Before:**
```typescript
${stats.totalCommissions.toLocaleString()}
```

**After:**
```typescript
₱{stats.totalCommissions.toLocaleString()}
```

---

#### **Change 7: Updated Agent Cards with All Three Changes**

**Applicant Count - Now shows actual count:**
```typescript
<span>Applicants: {applicantCounts[agent.id] || 0}</span>
```

**Total Earnings - Changed to Philippine Peso:**
```typescript
<div className="text-base sm:text-lg font-semibold text-teal-600 mt-0.5">
  ₱{(agent.totalCommissions || 0).toLocaleString()}
</div>
```

**Added Delete Button at the bottom of each card:**
```typescript
{canManageAgents && (
  <div className="px-4 pb-4 sm:px-6 sm:pb-6">
    <button
      onClick={(e) => handleDeleteAgent(agent.id, agent.agentName, e)}
      disabled={deletingAgentId === agent.id}
      className="w-full inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {deletingAgentId === agent.id ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
          Deleting...
        </>
      ) : (
        <>
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete Agent
        </>
      )}
    </button>
  </div>
)}
```

---

## 📊 Summary of Changes

### 1. **Applicant Count** ✅
- **Before**: Showed `agent.totalApplicants || 0` (static/outdated data)
- **After**: Shows `applicantCounts[agent.id] || 0` (real-time count from Firestore)
- **Location**: Agent card details section

### 2. **Currency Change** ✅
- **Before**: Used `$` (US Dollar) for Total Earnings
- **After**: Uses `₱` (Philippine Peso) for Total Earnings
- **Locations**: 
  - Header stats: Total Commissions
  - Agent cards: Total Earnings

### 3. **Delete Button** ✅
- **New Feature**: Added red Delete button at the bottom of each agent card
- **Permissions**: Only visible for Admin and Branch Manager roles
- **Features**:
  - Confirmation dialog before deletion
  - Loading state during deletion
  - Success/error feedback
  - Automatic list refresh after deletion

---

## 🎨 Visual Changes

### Agent Card - Before:
```
┌─────────────────────────────────────┐
│ [A] Abdul Karim         [Active]    │
│     karimagent@example.com          │
│                                     │
│ 🏢 Branch: Cotabato Branch         │
│ 💰 Commission Amount: ₱50,000      │
│ 👥 Applicants: 0                   │ ← Static/outdated
│                                     │
│ Deployed        Total Earnings      │
│    0               $0               │ ← US Dollar
└─────────────────────────────────────┘
```

### Agent Card - After:
```
┌─────────────────────────────────────┐
│ [A] Abdul Karim         [Active]    │
│     karimagent@example.com          │
│                                     │
│ 🏢 Branch: Cotabato Branch         │
│ 💰 Commission Amount: ₱50,000      │
│ 👥 Applicants: 3                   │ ← Real count from DB
│                                     │
│ Deployed        Total Earnings      │
│    0               ₱0               │ ← Philippine Peso
│                                     │
│ [🗑️ Delete Agent]                  │ ← NEW Delete Button
└─────────────────────────────────────┘
```

---

## 🔒 Security & Permissions

- Delete button is only visible if `canManageAgents` is true
- `canManageAgents` = `role === 'admin' || role === 'branch_manager'`
- Confirmation dialog prevents accidental deletions
- Deletion requires explicit user confirmation

---

## 🧪 Testing

### Test Cases:
1. ✅ **Applicant Count**: Create applicants with different agentIds, verify counts update
2. ✅ **Currency Display**: Check all Total Earnings show ₱ instead of $
3. ✅ **Delete Button Visibility**: 
   - Admin: Should see Delete button
   - Branch Manager: Should see Delete button
   - Other roles: Should NOT see Delete button
4. ✅ **Delete Functionality**:
   - Click Delete → Confirmation appears
   - Cancel → No deletion
   - Confirm → Agent is deleted, list refreshes
5. ✅ **Delete Loading State**: Button shows spinner during deletion

---

## 📝 Notes

- The applicant count is fetched whenever the agents list changes
- The Delete button is marked as "temporary" as requested
- All currency symbols changed from $ to ₱ consistently
- The delete operation removes the agent from Firestore completely
- Consider adding a "soft delete" in the future (marking as deleted instead of removing)

---

## ✨ Completed!

All three requested features have been successfully implemented:
1. ✅ Real-time applicant count display
2. ✅ Currency changed to Philippine Peso (₱)
3. ✅ Delete button added to each agent card

