import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import type { Expense } from '../types/expense';
import type { Commission } from '../types/commission';
import * as XLSX from 'xlsx';

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  branchId?: string;
  agentId?: string;
  applicantId?: string;
  type?: string;
  status?: string;
}

export interface ReportSummary {
  totalAmount: number;
  count: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  byStatus: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
  byType: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
  byMonth: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

export class ReportGenerator {
  private static instance: ReportGenerator;

  private constructor() {}

  public static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  public async generateExpenseReport(
    filter: ReportFilter
  ): Promise<{
    data: Expense[];
    summary: ReportSummary;
  }> {
    try {
      let q = collection(firestore, 'expenses');

      // Apply filters
      const conditions = [];

      if (filter.startDate) {
        conditions.push(
          where('expenseDate', '>=', Timestamp.fromDate(filter.startDate))
        );
      }

      if (filter.endDate) {
        conditions.push(
          where('expenseDate', '<=', Timestamp.fromDate(filter.endDate))
        );
      }

      if (filter.branchId) {
        conditions.push(where('branchId', '==', filter.branchId));
      }

      if (filter.applicantId) {
        conditions.push(where('applicantId', '==', filter.applicantId));
      }

      if (filter.type) {
        conditions.push(where('expenseType', '==', filter.type));
      }

      if (filter.status) {
        conditions.push(where('status', '==', filter.status));
      }

      q = query(q, ...conditions, orderBy('expenseDate', 'desc'));

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Expense)
      );

      const summary = this.calculateExpenseSummary(expenses);

      return {
        data: expenses,
        summary,
      };
    } catch (error) {
      console.error('Failed to generate expense report:', error);
      throw error;
    }
  }

  public async generateCommissionReport(
    filter: ReportFilter
  ): Promise<{
    data: Commission[];
    summary: ReportSummary;
  }> {
    try {
      let q = collection(firestore, 'commissions');

      // Apply filters
      const conditions = [];

      if (filter.startDate) {
        conditions.push(
          where('createdAt', '>=', Timestamp.fromDate(filter.startDate))
        );
      }

      if (filter.endDate) {
        conditions.push(
          where('createdAt', '<=', Timestamp.fromDate(filter.endDate))
        );
      }

      if (filter.branchId) {
        conditions.push(where('branchId', '==', filter.branchId));
      }

      if (filter.agentId) {
        conditions.push(where('agentId', '==', filter.agentId));
      }

      if (filter.applicantId) {
        conditions.push(where('applicantId', '==', filter.applicantId));
      }

      if (filter.type) {
        conditions.push(where('commissionType', '==', filter.type));
      }

      if (filter.status) {
        conditions.push(where('status', '==', filter.status));
      }

      q = query(q, ...conditions, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      const commissions = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Commission)
      );

      // Enrich commission data with agent and branch names
      const enrichedCommissions = await Promise.all(
        commissions.map(async (commission) => {
          let agentName = 'N/A';
          let branchName = 'N/A';

          // Fetch agent name
          if (commission.agentId) {
            try {
              const agentDoc = await getDoc(doc(firestore, 'agents', commission.agentId));
              if (agentDoc.exists()) {
                agentName = agentDoc.data().agentName || 'N/A';
              }
            } catch (err) {
              console.error('Error fetching agent:', err);
            }
          }

          // Fetch branch name
          if (commission.branchId) {
            try {
              const branchDoc = await getDoc(doc(firestore, 'branches', commission.branchId));
              if (branchDoc.exists()) {
                branchName = branchDoc.data().branchName || 'N/A';
              }
            } catch (err) {
              console.error('Error fetching branch:', err);
            }
          }

          return {
            ...commission,
            agentName,
            branchName,
          };
        })
      );

      const summary = this.calculateCommissionSummary(commissions);

      return {
        data: enrichedCommissions as any,
        summary,
      };
    } catch (error) {
      console.error('Failed to generate commission report:', error);
      throw error;
    }
  }

  private calculateExpenseSummary(expenses: Expense[]): ReportSummary {
    const summary: ReportSummary = {
      totalAmount: 0,
      count: expenses.length,
      averageAmount: 0,
      minAmount: expenses.length > 0 ? expenses[0].amount : 0,
      maxAmount: 0,
      byStatus: {},
      byType: {},
      byMonth: {},
    };

    for (const expense of expenses) {
      // Total amount
      summary.totalAmount += expense.amount;

      // Min/Max amount
      summary.minAmount = Math.min(summary.minAmount, expense.amount);
      summary.maxAmount = Math.max(summary.maxAmount, expense.amount);

      // By status
      if (!summary.byStatus[expense.status]) {
        summary.byStatus[expense.status] = { count: 0, amount: 0 };
      }
      summary.byStatus[expense.status].count++;
      summary.byStatus[expense.status].amount += expense.amount;

      // By type
      if (!summary.byType[expense.expenseType]) {
        summary.byType[expense.expenseType] = { count: 0, amount: 0 };
      }
      summary.byType[expense.expenseType].count++;
      summary.byType[expense.expenseType].amount += expense.amount;

      // By month
      // Handle expenseDate which could be a Timestamp or Date or null
      const expenseDate = expense.expenseDate?.toDate ? expense.expenseDate.toDate() : expense.expenseDate;
      const dateObj = expenseDate ? new Date(expenseDate) : null;
      const month = dateObj && !isNaN(dateObj.getTime())
        ? dateObj.toISOString().slice(0, 7)
        : new Date().toISOString().slice(0, 7);

      if (!summary.byMonth[month]) {
        summary.byMonth[month] = { count: 0, amount: 0 };
      }
      summary.byMonth[month].count++;
      summary.byMonth[month].amount += expense.amount;
    }

    // Calculate average
    summary.averageAmount =
      summary.count > 0 ? summary.totalAmount / summary.count : 0;

    return summary;
  }

  private calculateCommissionSummary(commissions: Commission[]): ReportSummary {
    const summary: ReportSummary = {
      totalAmount: 0,
      count: commissions.length,
      averageAmount: 0,
      minAmount: commissions.length > 0 ? commissions[0].amount : 0,
      maxAmount: 0,
      byStatus: {},
      byType: {},
      byMonth: {},
    };

    for (const commission of commissions) {
      // Total amount
      summary.totalAmount += commission.amount;

      // Min/Max amount
      summary.minAmount = Math.min(summary.minAmount, commission.amount);
      summary.maxAmount = Math.max(summary.maxAmount, commission.amount);

      // By status
      if (!summary.byStatus[commission.status]) {
        summary.byStatus[commission.status] = { count: 0, amount: 0 };
      }
      summary.byStatus[commission.status].count++;
      summary.byStatus[commission.status].amount += commission.amount;

      // By type
      if (!summary.byType[commission.commissionType]) {
        summary.byType[commission.commissionType] = { count: 0, amount: 0 };
      }
      summary.byType[commission.commissionType].count++;
      summary.byType[commission.commissionType].amount += commission.amount;

      // By month
      // Handle createdAt which could be a Timestamp or Date or null
      const createdAt = commission.createdAt?.toDate ? commission.createdAt.toDate() : commission.createdAt;
      const dateObj = createdAt ? new Date(createdAt) : null;
      const month = dateObj && !isNaN(dateObj.getTime())
        ? dateObj.toISOString().slice(0, 7)
        : new Date().toISOString().slice(0, 7);

      if (!summary.byMonth[month]) {
        summary.byMonth[month] = { count: 0, amount: 0 };
      }
      summary.byMonth[month].count++;
      summary.byMonth[month].amount += commission.totalAmount;
    }

    // Calculate average
    summary.averageAmount =
      summary.count > 0 ? summary.totalAmount / summary.count : 0;

    return summary;
  }

  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  public generateCSV(data: any[], fields: string[]): string {
    const header = fields.join(',') + '\n';
    const rows = data.map((item) =>
      fields
        .map((field) => {
          const value = item[field];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        })
        .join(',')
    );
    return header + rows.join('\n');
  }

  public async exportToCSV(
    data: any[],
    fields: string[],
    filename: string
  ): Promise<void> {
    const csv = this.generateCSV(data, fields);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  public async exportToExcel(
    data: any[],
    fields: string[],
    filename: string
  ): Promise<void> {
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate Excel file and trigger download
    // XLSX.writeFile automatically adds .xlsx extension and sets proper MIME type
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
}
