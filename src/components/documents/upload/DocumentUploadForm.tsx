import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { documentUploadSchema } from '../../../schemas/document';
import { FileUpload } from './FileUpload';
import { DOCUMENT_CONFIG, DocumentType } from '../../../types/document';
import { useDocumentStore } from '../../../stores/documentStore';
import { useAuth } from '../../../contexts/AuthContext';

interface DocumentUploadFormProps {
  applicantId: string;
  documentType: DocumentType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DocumentUploadForm = ({
  applicantId,
  documentType,
  onSuccess,
  onCancel,
}: DocumentUploadFormProps) => {
  const { user } = useAuth();
  const { uploadDocument } = useDocumentStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      applicantId,
      documentType,
      metadata: {
        issuedBy: '',
        issuedAt: '',
        documentNumber: '',
      },
      tags: [],
      notes: '',
    },
  });

  const config = DOCUMENT_CONFIG[documentType];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setValue('file', file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setValue('file', undefined);
  };

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }
    
    if (!user) {
      alert('You must be logged in to upload documents');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await uploadDocument({
        applicantId: data.applicantId,
        documentType: data.documentType,
        file: selectedFile,
        metadata: {
          ...data.metadata,
          uploadedBy: user.uid,
        },
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Upload {config.label}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {config.description}
        </p>
      </div>

      <FileUpload
        documentType={documentType}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        error={errors.file?.message}
      />

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="issuedBy"
            className="block text-sm font-medium text-gray-700"
          >
            Issued By <span className="text-red-600">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('metadata.issuedBy')}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          {errors.metadata?.issuedBy && (
            <p className="mt-1 text-sm text-red-600">{errors.metadata.issuedBy.message as string}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="issuedAt"
            className="block text-sm font-medium text-gray-700"
          >
            Issue Date <span className="text-red-600">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              {...register('metadata.issuedAt')}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          {errors.metadata?.issuedAt && (
            <p className="mt-1 text-sm text-red-600">{errors.metadata.issuedAt.message as string}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="documentNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Document Number <span className="text-red-600">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('metadata.documentNumber')}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          {errors.metadata?.documentNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.metadata.documentNumber.message as string}</p>
          )}
        </div>

        {config.expiryEnabled && (
          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-gray-700"
            >
              Expiry Date <span className="text-red-600">*</span>
            </label>
            <div className="mt-1">
              <input
                type="date"
                {...register('expiryDate')}
                required
                min={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message as string}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              📅 You'll receive notifications 30 days before expiry
            </p>
          </div>
        )}

        {!config.expiryEnabled && documentType === 'owwa' && (
          <div className="sm:col-span-2">
            <div className="rounded-md bg-blue-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    OWWA Certificate does not expire
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    No expiry date required for this document type
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="sm:col-span-2">
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700"
          >
            Tags
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('tags')}
              placeholder="Separate tags with commas"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <div className="mt-1">
            <textarea
              {...register('notes')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !selectedFile}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
};
