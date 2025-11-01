import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PreviewData {
  columns: string[];
  rows: any[][];
  totalCount: number;
  isEstimate: boolean;
}

interface LivePreviewProps {
  reportType: string;
  filters: any[];
  metrics: any[];
  onPreviewData?: (data: PreviewData) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  reportType,
  filters,
  metrics,
  onPreviewData,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate mock preview data (replace with actual API call)
  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock data based on configuration
      const mockData = generateMockData(reportType, filters, metrics);
      setPreviewData(mockData);
      onPreviewData?.(mockData);
    } catch (err) {
      setError('Failed to generate preview. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh preview when config changes
  useEffect(() => {
    if (metrics.length > 0) {
      generatePreview();
    } else {
      setPreviewData(null);
    }
  }, [reportType, JSON.stringify(filters), JSON.stringify(metrics)]);

  const generateMockData = (
    type: string,
    filters: any[],
    metrics: any[]
  ): PreviewData => {
    // Generate column names from metrics
    const columns = metrics.map((m) => m.name || `${m.calculation} of ${m.field}`);

    // Generate sample rows
    const rowCount = 5;
    const rows: any[][] = [];

    for (let i = 0; i < rowCount; i++) {
      const row: any[] = [];
      metrics.forEach((metric) => {
        // Generate sample values based on calculation type
        let value: any;
        switch (metric.calculation) {
          case 'count':
            value = Math.floor(Math.random() * 100) + 10;
            break;
          case 'sum':
            value = (Math.random() * 50000 + 1000).toFixed(2);
            break;
          case 'average':
            value = (Math.random() * 5000 + 500).toFixed(2);
            break;
          case 'min':
            value = (Math.random() * 1000 + 100).toFixed(2);
            break;
          case 'max':
            value = (Math.random() * 10000 + 5000).toFixed(2);
            break;
          default:
            value = Math.floor(Math.random() * 100);
        }

        // Format based on metric format
        if (metric.format === 'currency') {
          value = `$${Number(value).toLocaleString()}`;
        } else if (metric.format === 'percentage') {
          value = `${value}%`;
        } else if (metric.format === 'number') {
          value = Number(value).toLocaleString();
        }

        row.push(value);
      });
      rows.push(row);
    }

    return {
      columns,
      rows,
      totalCount: 127, // Mock total count
      isEstimate: true,
    };
  };

  if (!isExpanded) {
    return (
      <div className="border border-gray-200 rounded-lg bg-white">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Show Live Preview</span>
            {previewData && (
              <span className="text-xs text-gray-500">
                ({previewData.totalCount} records)
              </span>
            )}
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          {previewData && (
            <span className="text-xs text-gray-600">
              (Showing first 5 of ~{previewData.totalCount} records)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generatePreview}
            disabled={isLoading || metrics.length === 0}
            className="p-1.5 hover:bg-white/50 rounded transition-colors disabled:opacity-50"
            title="Refresh preview"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-white/50 rounded transition-colors"
            title="Collapse preview"
          >
            <ChevronUp className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Empty State */}
        {metrics.length === 0 && (
          <div className="text-center py-8">
            <EyeOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">No preview available</p>
            <p className="text-sm text-gray-400">
              Add at least one metric to see a preview of your report
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600">Generating preview...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Preview Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {!isLoading && !error && previewData && (
          <div className="relative overflow-x-auto">
            {/* Sample Data Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-10">
              <div className="text-6xl font-bold text-blue-600 rotate-[-15deg] select-none">
                SAMPLE DATA
              </div>
            </div>

            {/* Prominent Sample Data Banner */}
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    📊 This is Sample Data for Preview Only
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    The actual report will contain real data from your database based on the filters and metrics you've configured.
                  </p>
                </div>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200 relative">
              <thead className="bg-gray-50">
                <tr>
                  {previewData.columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-blue-50 transition-colors bg-blue-50/30"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Info */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  {previewData.isEstimate
                    ? 'Sample data - actual results may vary'
                    : 'Live data from your database'}
                </span>
              </div>
              <div>
                Filters applied: {filters.length || 'None'}
              </div>
            </div>
          </div>
        )}

        {/* Configuration Summary */}
        {previewData && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Current Configuration
            </h4>
            <div className="space-y-1 text-xs text-blue-800">
              <div>
                <strong>Report Type:</strong> {reportType}
              </div>
              <div>
                <strong>Filters:</strong>{' '}
                {filters.length > 0
                  ? filters.map((f) => `${f.field} ${f.operator} ${f.value}`).join(', ')
                  : 'None'}
              </div>
              <div>
                <strong>Metrics:</strong>{' '}
                {metrics.map((m) => `${m.calculation} of ${m.field || 'records'}`).join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
