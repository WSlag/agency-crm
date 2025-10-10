import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Commission } from '../types/commission';

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
}

export interface CommissionReport {
  totalAmount: number;
  commissionCount: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  commissions: Commission[];
}

export interface BranchReport {
  branchId: string;
  totalCommissions: number;
  totalAmount: number;
  applicantCount: number;
  deployedCount: number;
}

export class BasicReports {
  /**
   * Generate commission report
   */
  static async generateCommissionReport(
    branchId: string,
    period: ReportPeriod
  ): Promise<CommissionReport> {
    try {
      const q = query(
        collection(db, 'commissions'),
        where('branchId', '==', branchId),
        where('requestedAt', '>=', Timestamp.fromDate(period.startDate)),
        where('requestedAt', '<=', Timestamp.fromDate(period.endDate)),
        orderBy('requestedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const commissions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Commission[];

      const report: CommissionReport = {
        totalAmount: 0,
        commissionCount: commissions.length,
        pendingAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
        commissions
      };

      commissions.forEach(commission => {
        report.totalAmount += commission.amount;
        switch (commission.status) {
          case 'pending':
          case 'verified':
            report.pendingAmount += commission.amount;
            break;
          case 'approved':
            report.approvedAmount += commission.amount;
            break;
          case 'paid':
            report.paidAmount += commission.amount;
            break;
        }
      });

      return report;
    } catch (error) {
      console.error('Error generating commission report:', error);
      throw error;
    }
  }

  /**
   * Generate branch performance report
   */
  static async generateBranchReport(
    branchId: string,
    period: ReportPeriod
  ): Promise<BranchReport> {
    try {
      // Get commissions
      const commissionsQuery = query(
        collection(db, 'commissions'),
        where('branchId', '==', branchId),
        where('requestedAt', '>=', Timestamp.fromDate(period.startDate)),
        where('requestedAt', '<=', Timestamp.fromDate(period.endDate))
      );

      // Get applicants
      const applicantsQuery = query(
        collection(db, 'applicants'),
        where('branchId', '==', branchId),
        where('createdAt', '>=', Timestamp.fromDate(period.startDate)),
        where('createdAt', '<=', Timestamp.fromDate(period.endDate))
      );

      // Get deployed applicants
      const deployedQuery = query(
        collection(db, 'applicants'),
        where('branchId', '==', branchId),
        where('currentStage', '==', 'deployed'),
        where('createdAt', '>=', Timestamp.fromDate(period.startDate)),
        where('createdAt', '<=', Timestamp.fromDate(period.endDate))
      );

      const [commissionsSnap, applicantsSnap, deployedSnap] = await Promise.all([
        getDocs(commissionsQuery),
        getDocs(applicantsQuery),
        getDocs(deployedQuery)
      ]);

      const totalAmount = commissionsSnap.docs.reduce(
        (sum, doc) => sum + doc.data().amount,
        0
      );

      return {
        branchId,
        totalCommissions: commissionsSnap.size,
        totalAmount,
        applicantCount: applicantsSnap.size,
        deployedCount: deployedSnap.size
      };
    } catch (error) {
      console.error('Error generating branch report:', error);
      throw error;
    }
  }

  /**
   * Export report to CSV
   */
  static exportToCSV(data: any[], filename: string): void {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
