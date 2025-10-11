import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentType, DOCUMENT_TYPE_LABELS } from '../../types/document';
import { DocumentService } from '../../services/documentService';
import LoadingSpinner from '../common/LoadingSpinner';

interface DocumentUploadProps {
  applicantId: string;
  documentType: DocumentType;
  onUploadComplete: (documentId: string) => void;
  onError?: (error: Error) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  applicantId,
  documentType,
  onUploadComplete,
  onError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await DocumentService.uploadDocument(
        file,
        applicantId,
        documentType,
        {
          uploadedBy: 'current-user-id', // Replace with actual user ID
          documentType
        }
      );

      setUploadProgress(100);
      onUploadComplete(result.documentId);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error as Error);
    } finally {
      setIsUploading(false);
    }
  }, [applicantId, documentType, onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          hover:border-primary-500 hover:bg-primary-50
          transition-colors duration-200
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        <div className="text-center">
          {isUploading ? (
            <div className="space-y-3">
              <LoadingSpinner size="medium" />
              <p className="text-sm text-gray-500">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <>
              <div className="text-primary-500 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14M8 14c0-4.418 3.582-8 8-8h16c4.418 0 8 3.582 8 8M8 14h32"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Drop your {DOCUMENT_TYPE_LABELS[documentType]} here, or{' '}
                <span className="text-primary-500">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { DocumentUpload };
