import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import type {
  Report,
  ReportType,
  ReportFormat,
  ReportFilter,
  ApplicantReport,
  CommissionReport,
  ExpenseReport,
  TransferReport,
  OfficerReport,
  DeploymentReport,
  BranchReport,
} from '../types/report';

export class ReportExporter {
  private static instance: ReportExporter;

  private constructor() {}

  public static getInstance(): ReportExporter {
    if (!ReportExporter.instance) {
      ReportExporter.instance = new ReportExporter();
    }
    return ReportExporter.instance;
  }

  public async exportReport(
    type: ReportType,
    format: ReportFormat,
    filters: ReportFilter,
    columns: string[]
  ): Promise<string> {
    try {
      const generateReport = httpsCallable<
        {
          type: ReportType;
          format: ReportFormat;
          filters: ReportFilter;
          columns: string[];
        },
        { fileUrl: string }
      >(functions, 'generateReport');

      const result = await generateReport({
        type,
        format,
        filters,
        columns,
      });

      return result.data.fileUrl;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }

  public async exportToPDF(data: any, type: ReportType): Promise<Blob> {
    try {
      const generatePDF = httpsCallable<
        {
          data: any;
          type: ReportType;
        },
        { base64: string }
      >(functions, 'generatePDF');

      const result = await generatePDF({
        data,
        type,
      });

      // Convert base64 to Blob
      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'application/pdf' });
    } catch (error) {
      console.error('Failed to export to PDF:', error);
      throw error;
    }
  }

  public async exportToExcel(data: any, type: ReportType): Promise<Blob> {
    try {
      const generateExcel = httpsCallable<
        {
          data: any;
          type: ReportType;
        },
        { base64: string }
      >(functions, 'generateExcel');

      const result = await generateExcel({
        data,
        type,
      });

      // Convert base64 to Blob
      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      throw error;
    }
  }

  public async exportToCSV(data: any, type: ReportType): Promise<string> {
    try {
      const headers = this.getHeaders(type);
      const rows = this.formatData(data, type);
      return this.generateCSV(headers, rows);
    } catch (error) {
      console.error('Failed to export to CSV:', error);
      throw error;
    }
  }

  private getHeaders(type: ReportType): string[] {
    switch (type) {
      case 'applicant':
        return [
          'Full Name',
          'Contact Info',
          'Current Stage',
          'Agent',
          'Branch',
          'Assigned Officer',
          'Status',
          'Created At',
        ];
      case 'commission':
        return [
          'Agent',
          'Applicant',
          'Commission Type',
          'Amount',
          'Status',
          'Created At',
        ];
      case 'expense':
        return [
          'Expense Type',
          'Amount',
          'Description',
          'Status',
          'Created At',
        ];
      case 'transfer':
        return [
          'Applicant',
          'From Branch',
          'To Branch',
          'Status',
          'Requested At',
        ];
      default:
        return [];
    }
  }

  private formatData(data: any, type: ReportType): any[] {
    switch (type) {
      case 'applicant':
        return this.formatApplicantData(data as ApplicantReport[]);
      case 'commission':
        return this.formatCommissionData(data as CommissionReport[]);
      case 'expense':
        return this.formatExpenseData(data as ExpenseReport[]);
      case 'transfer':
        return this.formatTransferData(data as TransferReport[]);
      default:
        return [];
    }
  }

  private formatApplicantData(data: ApplicantReport[]): any[] {
    return data.map((item) => [
      item.applicant.fullName,
      item.applicant.contactInfo,
      item.applicant.currentStage,
      item.agent?.name || 'N/A',
      item.branch.name,
      item.assignedOfficer || 'N/A',
      item.applicant.status,
      new Date(item.applicant.createdAt).toLocaleDateString(),
    ]);
  }

  private formatCommissionData(data: CommissionReport[]): any[] {
    return data.map((item) => [
      item.agent.name,
      item.commissions[0].applicantId,
      item.commissions[0].commissionType,
      item.commissions[0].totalAmount,
      item.commissions[0].status,
      new Date(item.commissions[0].createdAt).toLocaleDateString(),
    ]);
  }

  private formatExpenseData(data: ExpenseReport[]): any[] {
    return data.map((item) => [
      item.expenses[0].expenseType,
      item.expenses[0].amount,
      item.expenses[0].description,
      item.expenses[0].status,
      new Date(item.expenses[0].createdAt).toLocaleDateString(),
    ]);
  }

  private formatTransferData(data: TransferReport[]): any[] {
    return data.map((item) => [
      item.transfers[0].applicantId,
      item.branch.name,
      'Head Office',
      item.transfers[0].status,
      new Date(item.transfers[0].requestedAt).toLocaleDateString(),
    ]);
  }

  private generateCSV(headers: string[], rows: any[]): string {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell: any) =>
            typeof cell === 'string' && cell.includes(',')
              ? `"${cell}"`
              : cell
          )
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  public downloadFile(content: Blob | string, filename: string): void {
    const link = document.createElement('a');
    if (content instanceof Blob) {
      link.href = URL.createObjectURL(content);
    } else {
      link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
    }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
