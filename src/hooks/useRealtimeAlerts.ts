import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export interface Alert {
  id: string;
  type: 'expense' | 'commission' | 'document' | 'transfer' | 'stage_advancement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  actionUrl: string;
  count?: number;
}

export const useRealtimeAlerts = (branchId?: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Pending Expenses
    const expensesQuery = branchId
      ? query(
          collection(firestore, 'expenses'),
          where('branchId', '==', branchId),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      : query(
          collection(firestore, 'expenses'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const count = snapshot.size;
      if (count > 0) {
        setAlerts(prev => {
          const filtered = prev.filter(a => a.type !== 'expense');
          return [...filtered, {
            id: 'expense-pending',
            type: 'expense',
            title: 'Pending Expense Approvals',
            description: `${count} expense${count > 1 ? 's' : ''} awaiting approval`,
            priority: count > 5 ? 'high' : 'medium',
            timestamp: new Date(),
            actionUrl: '/expenses',
            count
          }];
        });
      } else {
        setAlerts(prev => prev.filter(a => a.type !== 'expense'));
      }
    });
    unsubscribers.push(unsubExpenses);

    // Pending Commissions
    const commissionsQuery = branchId
      ? query(
          collection(firestore, 'commissions'),
          where('branchId', '==', branchId),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      : query(
          collection(firestore, 'commissions'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

    const unsubCommissions = onSnapshot(commissionsQuery, (snapshot) => {
      const count = snapshot.size;
      if (count > 0) {
        setAlerts(prev => {
          const filtered = prev.filter(a => a.type !== 'commission');
          return [...filtered, {
            id: 'commission-pending',
            type: 'commission',
            title: 'Pending Commission Requests',
            description: `${count} commission request${count > 1 ? 's' : ''} to review`,
            priority: count > 10 ? 'high' : 'medium',
            timestamp: new Date(),
            actionUrl: '/commissions',
            count
          }];
        });
      } else {
        setAlerts(prev => prev.filter(a => a.type !== 'commission'));
      }
    });
    unsubscribers.push(unsubCommissions);

    // Pending Transfers
    const transfersQuery = branchId
      ? query(
          collection(firestore, 'applicants'),
          where('branchId', '==', branchId),
          where('transferStatus', '==', 'pending'),
          limit(50)
        )
      : query(
          collection(firestore, 'applicants'),
          where('transferStatus', '==', 'pending'),
          limit(50)
        );

    const unsubTransfers = onSnapshot(transfersQuery, (snapshot) => {
      const count = snapshot.size;
      if (count > 0) {
        setAlerts(prev => {
          const filtered = prev.filter(a => a.type !== 'transfer');
          return [...filtered, {
            id: 'transfer-pending',
            type: 'transfer',
            title: 'Pending Transfer Requests',
            description: `${count} transfer${count > 1 ? 's' : ''} need attention`,
            priority: count > 3 ? 'high' : 'low',
            timestamp: new Date(),
            actionUrl: '/applicants/transfers',
            count
          }];
        });
      } else {
        setAlerts(prev => prev.filter(a => a.type !== 'transfer'));
      }
    });
    unsubscribers.push(unsubTransfers);

    // Expiring Documents (30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const documentsQuery = query(
      collection(firestore, 'documents'),
      where('expiryDate', '<=', Timestamp.fromDate(thirtyDaysFromNow)),
      where('status', '==', 'verified'),
      limit(50)
    );

    const unsubDocuments = onSnapshot(documentsQuery, (snapshot) => {
      const count = snapshot.size;
      if (count > 0) {
        setAlerts(prev => {
          const filtered = prev.filter(a => a.type !== 'document');
          return [...filtered, {
            id: 'document-expiring',
            type: 'document',
            title: 'Documents Expiring Soon',
            description: `${count} document${count > 1 ? 's' : ''} expiring within 30 days`,
            priority: 'medium',
            timestamp: new Date(),
            actionUrl: '/applicants/documents/expiring',
            count
          }];
        });
      } else {
        setAlerts(prev => prev.filter(a => a.type !== 'document'));
      }
    });
    unsubscribers.push(unsubDocuments);

    // Pending Stage Advancements
    const stageAdvancementsQuery = branchId
      ? query(
          collection(firestore, 'stage_history'),
          where('branchId', '==', branchId),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      : query(
          collection(firestore, 'stage_history'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

    const unsubStageAdvancements = onSnapshot(stageAdvancementsQuery, (snapshot) => {
      const count = snapshot.size;
      if (count > 0) {
        setAlerts(prev => {
          const filtered = prev.filter(a => a.type !== 'stage_advancement');
          return [...filtered, {
            id: 'stage-advancement-pending',
            type: 'stage_advancement',
            title: 'Pending Stage Advancements',
            description: `${count} applicant${count > 1 ? 's' : ''} waiting for approval to advance`,
            priority: count > 5 ? 'high' : 'medium',
            timestamp: new Date(),
            actionUrl: '/applicants',
            count
          }];
        });
      } else {
        setAlerts(prev => prev.filter(a => a.type !== 'stage_advancement'));
      }
    });
    unsubscribers.push(unsubStageAdvancements);

    setLoading(false);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [branchId]);

  useEffect(() => {
    setTotalCount(alerts.reduce((sum, alert) => sum + (alert.count || 0), 0));
  }, [alerts]);

  return { alerts, loading, totalCount };
};

