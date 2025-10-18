import { ReportResult } from './reportService';

export type ExportFormat = 'csv' | 'pdf' | 'excel';

export class ExportService {
  /**
   * Export report data to CSV format
   */
  exportToCSV(result: ReportResult): Blob {
    const { data, columns } = result;
    
    // Create CSV header
    const header = columns.map(col => this.escapeCSV(col.label)).join(',');
    
    // Create CSV rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col.field];
        return this.escapeCSV(this.formatValue(value, col.format));
      }).join(',');
    });
    
    // Combine header and rows
    const csvContent = [header, ...rows].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export report data to PDF format (simplified version)
   * For production, consider using jsPDF or pdfmake
   */
  exportToPDF(result: ReportResult): Blob {
    const { definition, data, summary } = result;
    
    let content = `REPORT: ${definition.name}\n`;
    content += `Generated: ${result.generatedAt.toLocaleString()}\n`;
    content += `\n${definition.description || ''}\n\n`;
    
    // Add summary statistics
    if (summary && Object.keys(summary).length > 0) {
      content += 'SUMMARY:\n';
      for (const [key, value] of Object.entries(summary)) {
        content += `  ${key}: ${value}\n`;
      }
      content += '\n';
    }
    
    // Add data table (simplified plain text format)
    content += 'DATA:\n';
    if (data.length > 0) {
      const firstRow = data[0];
      const headers = Object.keys(firstRow);
      content += headers.join(' | ') + '\n';
      content += headers.map(() => '---').join(' | ') + '\n';
      
      data.forEach(row => {
        content += headers.map(h => row[h] || '').join(' | ') + '\n';
      });
    }
    
    // For now, return as plain text
    // In production, use a proper PDF library
    return new Blob([content], { type: 'application/pdf' });
  }

  /**
   * Export report data to Excel format (simplified)
   * For production, consider using xlsx library
   */
  exportToExcel(result: ReportResult): Blob {
    // For now, use CSV format with .xlsx extension
    // In production, implement proper Excel export with formatting
    return this.exportToCSV(result);
  }

  /**
   * Download the exported file
   */
  downloadFile(blob: Blob, filename: string, format: ExportFormat) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export and download report in specified format
   */
  async exportReport(result: ReportResult, format: ExportFormat): Promise<void> {
    let blob: Blob;
    
    switch (format) {
      case 'csv':
        blob = this.exportToCSV(result);
        break;
      case 'pdf':
        blob = this.exportToPDF(result);
        break;
      case 'excel':
        blob = this.exportToExcel(result);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    const filename = `${result.definition.name.replace(/\s+/g, '_')}_${Date.now()}`;
    this.downloadFile(blob, filename, format);
  }

  /**
   * Escape special characters for CSV
   */
  private escapeCSV(value: string): string {
    if (typeof value !== 'string') {
      return String(value);
    }
    
    // Escape quotes and wrap in quotes if needed
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  /**
   * Format value based on column format
   */
  private formatValue(value: any, format?: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP'
        }).format(Number(value));
      
      case 'percentage':
        return `${(Number(value) * 100).toFixed(2)}%`;
      
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      
      case 'number':
        return new Intl.NumberFormat('en-US').format(Number(value));
      
      default:
        return String(value);
    }
  }
}

// Export singleton instance
export const exportService = new ExportService();

