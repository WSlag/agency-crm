import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, firestore } from '../../config/firebase';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

interface BulkDocumentUploadProps {
  applicantId: string;
  documentStage: 'interview' | 'medical' | 'processing' | 'deployment';
  onComplete: (uploadedFiles: string[]) => void;
  onCancel?: () => void;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const BulkDocumentUpload = ({ applicantId, documentStage, onComplete, onCancel }: BulkDocumentUploadProps) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { file } = fileWithProgress;
      
      // Update status to uploading
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading' as const } : f
      ));

      // Create storage reference
      const storageRef = ref(storage, `documents/${applicantId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Update progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress } : f
          ));
        },
        (error) => {
          // Handle error
          console.error('Upload error:', error);
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, status: 'error' as const, error: error.message } : f
          ));
          reject(error);
        },
        async () => {
          // Handle successful upload
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Create document metadata in Firestore
            const docRef = await addDoc(collection(firestore, 'documents'), {
              applicantId,
              documentType: getDocumentType(file.name),
              documentStage,
              fileUrl: downloadURL,
              fileName: file.name,
              fileSize: file.size,
              uploadDate: serverTimestamp(),
              status: 'pending',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            // Update status to completed
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, status: 'completed' as const, documentId: docRef.id } : f
            ));
            
            resolve();
          } catch (error) {
            console.error('Error creating document metadata:', error);
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, status: 'error' as const, error: 'Failed to save document metadata' } : f
            ));
            reject(error);
          }
        }
      );
    });
  };

  const getDocumentType = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('passport')) return 'passport';
    if (lower.includes('nbi')) return 'nbi_clearance';
    if (lower.includes('barangay')) return 'barangay_cert';
    if (lower.includes('medical')) return 'medical_cert';
    if (lower.includes('tesda')) return 'tesda_cert';
    if (lower.includes('owwa')) return 'owwa';
    if (lower.includes('contract')) return 'employment_contract';
    if (lower.includes('pdos')) return 'pdos';
    if (lower.includes('ticket')) return 'plane_ticket';
    return 'other';
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    try {
      // Upload all files in parallel
      await Promise.all(
        pendingFiles.map((file, originalIndex) => {
          const index = files.findIndex(f => f === file);
          return uploadFile(file, index);
        })
      );

      // Get all successfully uploaded document IDs
      const uploadedIds = files
        .filter(f => f.status === 'completed' && f.documentId)
        .map(f => f.documentId!);

      onComplete(uploadedIds);
    } catch (error) {
      console.error('Bulk upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const retryFailedUploads = async () => {
    const failedFiles = files.filter(f => f.status === 'error');
    
    for (const file of failedFiles) {
      const index = files.findIndex(f => f === file);
      try {
        await uploadFile(file, index);
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  };

  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'pending':
        return <DocumentIcon className="h-8 w-8 text-gray-400" />;
      case 'uploading':
        return <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-8 w-8 text-red-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className={`mx-auto h-16 w-16 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="mt-4 text-lg font-medium text-gray-900">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          or click to browse files
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
        </p>
      </div>

      {/* Statistics */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-600">Uploading</div>
            <div className="text-2xl font-bold text-blue-900">{uploadingCount}</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600">Completed</div>
            <div className="text-2xl font-bold text-green-900">{completedCount}</div>
          </div>
          <div className="bg-red-100 rounded-lg p-4">
            <div className="text-sm text-red-600">Failed</div>
            <div className="text-2xl font-bold text-red-900">{errorCount}</div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Selected Files ({files.length})</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {files.map((fileWithProgress, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-4"
              >
                {getStatusIcon(fileWithProgress.status)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileWithProgress.file.name}
                    </p>
                    <p className="text-xs text-gray-500 ml-2">
                      {formatFileSize(fileWithProgress.file.size)}
                    </p>
                  </div>
                  
                  {fileWithProgress.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileWithProgress.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {Math.round(fileWithProgress.progress)}%
                      </p>
                    </div>
                  )}
                  
                  {fileWithProgress.status === 'error' && fileWithProgress.error && (
                    <p className="mt-1 text-xs text-red-600">{fileWithProgress.error}</p>
                  )}
                  
                  {fileWithProgress.status === 'completed' && (
                    <p className="mt-1 text-xs text-green-600">Upload successful</p>
                  )}
                </div>

                {fileWithProgress.status === 'pending' && (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="space-x-3">
            {errorCount > 0 && (
              <button
                onClick={retryFailedUploads}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200 disabled:opacity-50"
              >
                Retry Failed ({errorCount})
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
          
          <button
            onClick={handleUploadAll}
            disabled={pendingCount === 0 || isUploading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : `Upload All (${pendingCount})`}
          </button>
        </div>
      )}
    </div>
  );
};

