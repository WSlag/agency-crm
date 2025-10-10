import { useState, useCallback } from 'react';
import { ReportExporter } from '../services/reportExporter';
import type {
  ReportType,
  ReportFormat,
  ReportFilter,
} from '../types/report';

interface UseReportExporterResult {
  exportReport: (
    type: ReportType,
    format: ReportFormat,
    filters: ReportFilter,
    columns: string[]
  ) => Promise<void>;
  exportToPDF: (data: any, type: ReportType, filename: string) => Promise<void>;
  exportToExcel: (data: any, type: ReportType, filename: string) => Promise<void>;
  exportToCSV: (data: any, type: ReportType, filename: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useReportExporter = (): UseReportExporterResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exporter = ReportExporter.getInstance();

  const exportReport = useCallback(
    async (
      type: ReportType,
      format: ReportFormat,
      filters: ReportFilter,
      columns: string[]
    ) => {
      try {
        setLoading(true);
        setError(null);
        const fileUrl = await exporter.exportReport(type, format, filters, columns);
        window.open(fileUrl, '_blank');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export report');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const exportToPDF = useCallback(
    async (data: any, type: ReportType, filename: string) => {
      try {
        setLoading(true);
        setError(null);
        const blob = await exporter.exportToPDF(data, type);
        exporter.downloadFile(blob, `${filename}.pdf`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export to PDF');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const exportToExcel = useCallback(
    async (data: any, type: ReportType, filename: string) => {
      try {
        setLoading(true);
        setError(null);
        const blob = await exporter.exportToExcel(data, type);
        exporter.downloadFile(blob, `${filename}.xlsx`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export to Excel');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const exportToCSV = useCallback(
    async (data: any, type: ReportType, filename: string) => {
      try {
        setLoading(true);
        setError(null);
        const csv = await exporter.exportToCSV(data, type);
        exporter.downloadFile(csv, `${filename}.csv`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export to CSV');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    exportReport,
    exportToPDF,
    exportToExcel,
    exportToCSV,
    loading,
    error,
  };
};