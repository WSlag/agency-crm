import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DOCUMENT_CONFIG } from '../../../types/document';

interface FileUploadProps {
  documentType: keyof typeof DOCUMENT_CONFIG;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  error?: string;
}

export const FileUpload = ({
  documentType,
  onFileSelect,
  onFileRemove,
  error,
}: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const config = DOCUMENT_CONFIG[documentType];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        // Validate file size
        if (file.size > config.maxFileSize) {
          alert(
            `File size must be less than ${config.maxFileSize / (1024 * 1024)}MB`
          );
          return;
        }

        // Validate file type
        if (!config.allowedTypes.includes(file.type)) {
          alert(
            `File type must be one of: ${config.allowedTypes
              .map((type) => type.split('/')[1])
              .join(', ')}`
          );
          return;
        }

        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [config.maxFileSize, config.allowedTypes, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as { [key: string]: string[] }),
    maxFiles: 1,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    onFileRemove();
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-500'
        } ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DocumentIcon className="h-8 w-8 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500">
                <span>Upload a file</span>
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {config.allowedTypes
                .map((type) => type.split('/')[1].toUpperCase())
                .join(', ')}{' '}
              up to {config.maxFileSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
