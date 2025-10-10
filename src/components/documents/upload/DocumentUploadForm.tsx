import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { documentUploadSchema } from '../../../schemas/document';
import { FileUpload } from './FileUpload';
import { DOCUMENT_CONFIG, DocumentType } from '../../../types/document';
import { useDocumentStore } from '../../../stores/documentStore';

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
  const { uploadDocument } = useDocumentStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      applicantId,
      documentType,
      metadata: {},
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
    try {
      setIsSubmitting(true);
      await uploadDocument({
        applicantId: data.applicantId,
        documentType: data.documentType,
        file: data.file,
        metadata: {
          ...data.metadata,
          issuedBy: data.issuedBy,
          issuedAt: data.issuedAt,
          documentNumber: data.documentNumber,
        },
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Upload {config.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Required for {config.stage} stage
          {config.expiryPeriod
            ? ` (expires after ${config.expiryPeriod / 30} months)`
            : ''}
        </p>
      </div>

      <FileUpload
        documentType={documentType}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        error={errors.file?.message as string}
      />

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="issuedBy"
            className="block text-sm font-medium text-gray-700"
          >
            Issued By
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('metadata.issuedBy')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="issuedAt"
            className="block text-sm font-medium text-gray-700"
          >
            Issue Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              {...register('metadata.issuedAt')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="documentNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Document Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('metadata.documentNumber')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        {config.expiryPeriod && (
          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-gray-700"
            >
              Expiry Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                {...register('expiryDate')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
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
