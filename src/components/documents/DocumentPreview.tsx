import React from 'react';
import OptimizedImage from '../common/OptimizedImage';

interface DocumentPreviewProps {
  url: string;
  type: string;
  className?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  type,
  className = ''
}) => {
  const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
  const isPDF = url.match(/\.pdf$/i);

  if (isImage) {
    return (
      <div className={`overflow-hidden bg-gray-100 ${className}`}>
        <OptimizedImage
          src={url}
          alt={`Document ${type}`}
          className="max-w-full h-auto"
        />
      </div>
    );
  }

  if (isPDF) {
    return (
      <div className={`overflow-hidden bg-gray-100 ${className}`}>
        <iframe
          src={url}
          title={`Document ${type}`}
          className="w-full h-full min-h-[600px] border-0"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <p className="text-gray-500">Preview not available for this document type</p>
    </div>
  );
};
