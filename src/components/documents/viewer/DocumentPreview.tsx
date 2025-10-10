import { useState, useEffect } from 'react';
import { Document as PDFDocument, Page } from 'react-pdf';
import { DocumentIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { Document } from '../../../types/document';

interface DocumentPreviewProps {
  document: Document;
  onOpenFullscreen?: () => void;
}

export const DocumentPreview = ({
  document,
  onOpenFullscreen,
}: DocumentPreviewProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when document changes
    setNumPages(null);
    setPageNumber(1);
    setError(null);
  }, [document]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    // Update metadata with page count
    document.metadata.pageCount = numPages;
  };

  const onDocumentLoadError = (error: Error) => {
    setError(error);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
        <DocumentIcon className="h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Error loading document: {error.message}
        </p>
      </div>
    );
  }

  const renderPreview = () => {
    const fileType = document.fileType.toLowerCase();

    if (fileType === 'application/pdf') {
      return (
        <PDFDocument
          file={document.fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={300}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
          {numPages && numPages > 1 && (
            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </PDFDocument>
      );
    }

    if (fileType.startsWith('image/')) {
      return (
        <img
          src={document.fileUrl}
          alt={document.fileName}
          className="max-w-full h-auto rounded-lg"
          onError={() => setError(new Error('Failed to load image'))}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
        <DocumentIcon className="h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <div className="relative">
      {onOpenFullscreen && (
        <button
          onClick={onOpenFullscreen}
          className="absolute top-2 right-2 p-1 rounded-md bg-white bg-opacity-75 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <ArrowsPointingOutIcon className="h-5 w-5" />
        </button>
      )}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {renderPreview()}
      </div>
    </div>
  );
};
