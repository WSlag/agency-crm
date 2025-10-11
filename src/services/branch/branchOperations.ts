import { firestore } from '../../config/firebase';
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Branch } from '../../types/entities/branch';

export interface BranchCreationData {
  name: string;
  type: 'HEAD_OFFICE' | 'BRANCH';
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  managers: string[];
}

export interface StaffRole {
  role: 'manager' | 'officer' | 'staff';
  permissions: string[];
}

export interface BranchMetrics {
  applicantCount: number;
  activeTransfers: number;
  pendingDocuments: number;
  completedPlacements: number;
  revenue: number;
  staffPerformance: {
    userId: string;
    metrics: {
      applicantsHandled: number;
      documentsProcessed: number;
      transfersManaged: number;
    };
  }[];
}

export class BranchOperations {
  private readonly branchesRef = collection(firestore, 'branches');

  async createBranch(data: BranchCreationData): Promise<string> {
    try {
      const branchRef = doc(this.branchesRef);
      const branch: Branch = {
        id: branchRef.id,
        ...data,
        metrics: {
          applicantCount: 0,
          activeTransfers: 0,
          pendingDocuments: 0,
          completedPlacements: 0,
          revenue: 0,
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(branchRef, branch);
      return branchRef.id;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw new Error('Failed to create branch');
    }
  }

  async updateBranch(id: string, updates: Partial<Branch>): Promise<void> {
    try {
      const branchRef = doc(this.branchesRef, id);
      await updateDoc(branchRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      throw new Error('Failed to update branch');
    }
  }

  async assignStaff(branchId: string, staffId: string, role: StaffRole): Promise<void> {
    try {
      const branchRef = doc(this.branchesRef, branchId);
      const branchDoc = await getDoc(branchRef);

      if (!branchDoc.exists()) {
        throw new Error('Branch not found');
      }

      const branch = branchDoc.data() as Branch;
      
      // Update staff assignments
      if (role.role === 'manager') {
        await updateDoc(branchRef, {
          managers: [...branch.managers, staffId],
          updatedAt: new Date(),
        });
      }

      // Create staff assignment record
      const staffAssignmentRef = doc(collection(firestore, 'staff_assignments'));
      await setDoc(staffAssignmentRef, {
        branchId,
        staffId,
        role: role.role,
        permissions: role.permissions,
        assignedAt: new Date(),
        status: 'active',
      });
    } catch (error) {
      console.error('Error assigning staff:', error);
      throw new Error('Failed to assign staff');
    }
  }

  async getBranchMetrics(branchId: string): Promise<BranchMetrics> {
    try {
      // Get branch details
      const branchRef = doc(this.branchesRef, branchId);
      const branchDoc = await getDoc(branchRef);

      if (!branchDoc.exists()) {
        throw new Error('Branch not found');
      }

      const branch = branchDoc.data() as Branch;

      // Get staff performance metrics
      const staffAssignmentsQuery = query(
        collection(firestore, 'staff_assignments'),
        where('branchId', '==', branchId),
        where('status', '==', 'active')
      );
      const staffAssignments = await getDocs(staffAssignmentsQuery);

      const staffPerformance = await Promise.all(
        staffAssignments.docs.map(async (assignment) => {
          const metricsQuery = query(
            collection(firestore, 'staff_metrics'),
            where('userId', '==', assignment.data().staffId),
            where('branchId', '==', branchId)
          );
          const metricsDoc = await getDocs(metricsQuery);
          const metrics = metricsDoc.docs[0]?.data() || {
            applicantsHandled: 0,
            documentsProcessed: 0,
            transfersManaged: 0,
          };

          return {
            userId: assignment.data().staffId,
            metrics,
          };
        })
      );

      return {
        ...branch.metrics,
        staffPerformance,
      };
    } catch (error) {
      console.error('Error getting branch metrics:', error);
      throw new Error('Failed to get branch metrics');
    }
  }
}
