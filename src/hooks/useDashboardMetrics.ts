import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { DashboardMetric } from '../types/navigation';
import type { UserRole } from '../types/auth';

interface DashboardData {
  metrics: DashboardMetric[];
  isLoading: boolean;
  error: Error | null;
}

export const useDashboardMetrics = (role: UserRole, branchId?: string | null): DashboardData => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch metrics based on role
        switch (role) {
          case 'admin': {
            const [users, branches, applicants] = await Promise.all([
              getDocs(collection(firestore, 'users')),
              getDocs(collection(firestore, 'branches')),
              getDocs(collection(firestore, 'applicants'))
            ]);

            setMetrics([
              {
                label: 'Total Users',
                value: users.size,
                type: 'number'
              },
              {
                label: 'Active Branches',
                value: branches.docs.filter(doc => doc.data().status === 'active').length,
                type: 'number'
              },
              {
                label: 'Total Applicants',
                value: applicants.size,
                type: 'number'
              }
            ]);
            break;
          }
          case 'branch_manager': {
            if (!branchId) {
              throw new Error('Branch ID is required for branch manager dashboard');
            }

            const [applicants, expenses] = await Promise.all([
              getDocs(query(
                collection(firestore, 'applicants'),
                where('status', '==', 'active'),
                where('branchId', '==', branchId)
              )),
              getDocs(query(
                collection(firestore, 'expenses'),
                where('status', '==', 'pending'),
                where('branchId', '==', branchId)
              ))
            ]);

            setMetrics([
              {
                label: 'Active Applicants',
                value: applicants.size,
                type: 'number'
              },
              {
                label: 'Pending Expenses',
                value: expenses.size,
                type: 'number'
              },
              {
                label: 'Monthly Target',
                value: 75,
                type: 'percentage',
                trend: 'up',
                change: 5
              }
            ]);
            break;
          }
          case 'ho_recruitment_officer': {
            const [assigned, pending] = await Promise.all([
              getDocs(query(
                collection(firestore, 'applicants'),
                where('status', '==', 'active'),
                where('assignedRecruitmentOfficerId', '==', 'currentUserId') // Replace with actual user ID
              )),
              getDocs(query(
                collection(firestore, 'applicants'),
                where('status', '==', 'pending_review')
              ))
            ]);

            setMetrics([
              {
                label: 'Assigned Cases',
                value: assigned.size,
                type: 'number'
              },
              {
                label: 'Pending Reviews',
                value: pending.size,
                type: 'number'
              },
              {
                label: 'Processing Time',
                value: '3.5d',
                trend: 'down',
                change: 12
              }
            ]);
            break;
          }
          case 'ho_accountant': {
            const [expenses, commissions] = await Promise.all([
              getDocs(query(
                collection(firestore, 'expenses'),
                where('status', '==', 'pending')
              )),
              getDocs(query(
                collection(firestore, 'commissions'),
                where('status', '==', 'pending')
              ))
            ]);

            const totalCommissions = commissions.docs.reduce(
              (sum, doc) => sum + doc.data().amount,
              0
            );

            setMetrics([
              {
                label: 'Pending Expenses',
                value: expenses.size,
                type: 'number'
              },
              {
                label: 'Outstanding Commissions',
                value: totalCommissions,
                type: 'currency'
              },
              {
                label: 'Monthly Revenue',
                value: 150000,
                type: 'currency',
                trend: 'up',
                change: 8
              }
            ]);
            break;
          }
          default:
            setMetrics([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [role]);

  return { metrics, isLoading, error };
};
