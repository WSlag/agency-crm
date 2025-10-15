import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { DashboardMetric } from '../types/navigation';
import type { UserRole } from '../types/auth';

interface DashboardData {
  metrics: DashboardMetric[];
  breakdowns?: Record<string, DashboardMetric[]>; // Additional breakdown data
  isLoading: boolean;
  error: Error | null;
}

// Helper to generate trend data from historical snapshots
const generateTrendData = (current: number, periods: number = 7): number[] => {
  // Generate sample trend data (in real implementation, fetch from historical data)
  const trend: number[] = [];
  const variance = current * 0.15; // 15% variance
  for (let i = 0; i < periods; i++) {
    const randomVariance = (Math.random() - 0.5) * variance;
    trend.push(Math.max(0, current - variance + randomVariance + (i * variance / periods)));
  }
  return trend;
};

// Helper to calculate trend direction and change percentage
const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down' | 'neutral', change: number } => {
  if (previous === 0) return { trend: 'neutral', change: 0 };
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 1) return { trend: 'neutral', change: 0 };
  return {
    trend: change > 0 ? 'up' : 'down',
    change: Math.abs(Math.round(change))
  };
};

export const useDashboardMetrics = (role: UserRole, branchId?: string | null): DashboardData => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [breakdowns, setBreakdowns] = useState<Record<string, DashboardMetric[]>>({});
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
            const [applicants, expenses, commissions] = await Promise.all([
              getDocs(collection(firestore, 'applicants')),
              getDocs(collection(firestore, 'expenses')),
              getDocs(collection(firestore, 'commissions'))
            ]);

            // Calculate stage breakdowns
            const applicantsByStage = applicants.docs.reduce((acc, doc) => {
              const stage = doc.data().currentStage || 'registration';
              acc[stage] = (acc[stage] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const interviewCount = applicantsByStage['interview'] || 0;
            const medicalCount = applicantsByStage['medical'] || 0;
            const processingCount = applicantsByStage['processing'] || 0;
            const deploymentCount = applicantsByStage['deployment'] || 0;
            const deployedCount = applicantsByStage['deployed'] || 0;

            // Calculate specific status counts
            const activeCount = applicants.docs.filter(doc => doc.data().status === 'active').length;
            const pendingApprovalCount = applicants.docs.filter(doc => {
              const data = doc.data();
              return data.requiresApproval === true && !data.approvedBy;
            }).length;
            const withdrawnCount = applicants.docs.filter(doc => doc.data().status === 'withdrawn').length;
            
            setMetrics([
              {
                label: 'Interview',
                value: interviewCount,
                type: 'number',
                trendData: generateTrendData(interviewCount),
                ...calculateTrend(interviewCount, Math.floor(interviewCount * 0.88))
              },
              {
                label: 'Medical',
                value: medicalCount,
                type: 'number',
                trendData: generateTrendData(medicalCount),
                ...calculateTrend(medicalCount, Math.floor(medicalCount * 0.95))
              },
              {
                label: 'Processing',
                value: processingCount,
                type: 'number',
                trendData: generateTrendData(processingCount),
                ...calculateTrend(processingCount, Math.floor(processingCount * 1.05))
              },
              {
                label: 'Deployment',
                value: deploymentCount + deployedCount,
                type: 'number',
                trendData: generateTrendData(deploymentCount + deployedCount),
                ...calculateTrend(deploymentCount + deployedCount, Math.floor((deploymentCount + deployedCount) * 0.92))
              }
            ]);

            // Set breakdowns for specific statuses
            setBreakdowns({
              applicantsByStage: [
                { label: 'Interview', value: interviewCount, type: 'number' as const },
                { label: 'Medical', value: medicalCount, type: 'number' as const },
                { label: 'Processing', value: processingCount, type: 'number' as const },
                { label: 'Deployment', value: deploymentCount + deployedCount, type: 'number' as const },
              ].filter(item => item.value > 0),
              applicantsByStatus: [
                { label: 'Active', value: activeCount, type: 'number' as const },
                { label: 'Pending Approval', value: pendingApprovalCount, type: 'number' as const },
                { label: 'Withdrawn', value: withdrawnCount, type: 'number' as const },
                { label: 'Deployed', value: deployedCount, type: 'number' as const },
              ].filter(item => item.value > 0)
            });
            break;
          }
          case 'branch_manager': {
            if (!branchId) {
              throw new Error('Branch ID is required for branch manager dashboard');
            }

            const [allApplicants, expenses, commissions] = await Promise.all([
              getDocs(query(
                collection(firestore, 'applicants'),
                where('branchId', '==', branchId)
              )),
              getDocs(query(
                collection(firestore, 'expenses'),
                where('branchId', '==', branchId)
              )),
              getDocs(query(
                collection(firestore, 'commissions'),
                where('branchId', '==', branchId)
              ))
            ]);

            const activeApplicants = allApplicants.docs.filter(doc => doc.data().status === 'active').length;
            const pendingExpenses = expenses.docs.filter(doc => doc.data().status === 'pending').length;
            const totalExpenseAmount = expenses.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            const deployedApplicants = allApplicants.docs.filter(doc => doc.data().status === 'deployed').length;
            const deploymentRate = allApplicants.size > 0 ? (deployedApplicants / allApplicants.size) * 100 : 0;

            setMetrics([
              {
                label: 'Active Applicants',
                value: activeApplicants,
                type: 'number',
                trendData: generateTrendData(activeApplicants),
                ...calculateTrend(activeApplicants, Math.floor(activeApplicants * 0.95))
              },
              {
                label: 'Total Applicants',
                value: allApplicants.size,
                type: 'number',
                trendData: generateTrendData(allApplicants.size)
              },
              {
                label: 'Pending Expenses',
                value: pendingExpenses,
                type: 'number',
                description: `₱${totalExpenseAmount.toLocaleString()} total`,
                ...calculateTrend(pendingExpenses, Math.floor(pendingExpenses * 1.15))
              },
              {
                label: 'Deployment Rate',
                value: Math.round(deploymentRate),
                type: 'percentage',
                ...calculateTrend(deploymentRate, deploymentRate * 0.93)
              }
            ]);

            // Breakdown by applicant status
            const applicantsByStatus = allApplicants.docs.reduce((acc, doc) => {
              const status = doc.data().status || 'pending';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            setBreakdowns({
              applicantsByStatus: Object.entries(applicantsByStatus).map(([status, count]) => ({
                label: status.replace('_', ' ').toUpperCase(),
                value: count,
                type: 'number'
              }))
            });
            break;
          }
          case 'ho_recruitment_officer': {
            const [allApplicants, documents] = await Promise.all([
              getDocs(collection(firestore, 'applicants')),
              getDocs(collection(firestore, 'documents'))
            ]);

            const pendingReview = allApplicants.docs.filter(doc => doc.data().status === 'pending_review').length;
            const inProcess = allApplicants.docs.filter(doc => doc.data().status === 'in_process').length;
            const completed = allApplicants.docs.filter(doc => doc.data().status === 'completed').length;
            const pendingDocs = documents.docs.filter(doc => doc.data().status === 'pending_verification').length;

            setMetrics([
              {
                label: 'Pending Reviews',
                value: pendingReview,
                type: 'number',
                trendData: generateTrendData(pendingReview),
                ...calculateTrend(pendingReview, Math.floor(pendingReview * 1.08))
              },
              {
                label: 'In Process',
                value: inProcess,
                type: 'number',
                trendData: generateTrendData(inProcess)
              },
              {
                label: 'Completed',
                value: completed,
                type: 'number',
                trendData: generateTrendData(completed),
                ...calculateTrend(completed, Math.floor(completed * 0.88))
              },
              {
                label: 'Pending Documents',
                value: pendingDocs,
                type: 'number',
                description: 'Awaiting verification'
              }
            ]);
            break;
          }
          case 'ho_accountant': {
            const [allExpenses, allCommissions] = await Promise.all([
              getDocs(collection(firestore, 'expenses')),
              getDocs(collection(firestore, 'commissions'))
            ]);

            const pendingExpenses = allExpenses.docs.filter(doc => doc.data().status === 'pending').length;
            const pendingExpenseAmount = allExpenses.docs
              .filter(doc => doc.data().status === 'pending')
              .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
            
            const pendingCommissions = allCommissions.docs.filter(doc => doc.data().status === 'pending').length;
            const pendingCommissionAmount = allCommissions.docs
              .filter(doc => doc.data().status === 'pending')
              .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            const approvedExpenseAmount = allExpenses.docs
              .filter(doc => doc.data().status === 'approved')
              .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            const paidCommissionAmount = allCommissions.docs
              .filter(doc => doc.data().status === 'paid')
              .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

            setMetrics([
              {
                label: 'Pending Expenses',
                value: pendingExpenses,
                type: 'number',
                description: `₱${pendingExpenseAmount.toLocaleString()}`,
                ...calculateTrend(pendingExpenses, Math.floor(pendingExpenses * 1.12))
              },
              {
                label: 'Approved Expenses',
                value: approvedExpenseAmount,
                type: 'currency',
                trendData: generateTrendData(approvedExpenseAmount)
              },
              {
                label: 'Pending Commissions',
                value: pendingCommissions,
                type: 'number',
                description: `₱${pendingCommissionAmount.toLocaleString()}`
              },
              {
                label: 'Paid Commissions',
                value: paidCommissionAmount,
                type: 'currency',
                trendData: generateTrendData(paidCommissionAmount),
                ...calculateTrend(paidCommissionAmount, paidCommissionAmount * 0.92)
              }
            ]);

            // Breakdowns by type
            const expensesByType = allExpenses.docs.reduce((acc, doc) => {
              const type = doc.data().type || 'Other';
              const amount = doc.data().amount || 0;
              acc[type] = (acc[type] || 0) + amount;
              return acc;
            }, {} as Record<string, number>);

            setBreakdowns({
              expensesByType: Object.entries(expensesByType).map(([type, amount]) => ({
                label: type,
                value: amount,
                type: 'currency'
              }))
            });
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
  }, [role, branchId]);

  return { metrics, breakdowns, isLoading, error };
};
