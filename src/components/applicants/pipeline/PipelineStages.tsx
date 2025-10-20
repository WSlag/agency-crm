import { useState } from 'react';
import { ApplicantStage, ApplicantPipeline } from '../../../types/applicant';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface PipelineStagesProps {
  currentStage: ApplicantStage;
  pipelineHistory: ApplicantPipeline[];
  onStageUpdate: (stage: ApplicantStage) => Promise<void>;
  requiredDocuments: {
    [key in ApplicantStage]: string[];
  };
  uploadedDocuments: {
    [key: string]: {
      fileUrl: string;
      status: 'pending' | 'verified' | 'rejected';
    };
  };
  onDocumentUpload: (stage: ApplicantStage, documentType: string, file: File) => Promise<void>;
}

const stages: ApplicantStage[] = [
  'interview',
  'medical',
  'processing',
  'selected',
  'deployed',
];

export const PipelineStages = ({
  currentStage,
  pipelineHistory,
  onStageUpdate,
  requiredDocuments,
  uploadedDocuments,
  onDocumentUpload,
}: PipelineStagesProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleStageUpdate = async (stage: ApplicantStage) => {
    try {
      setIsUpdating(true);
      await onStageUpdate(stage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (stage: ApplicantStage, documentType: string) => {
    if (!selectedFile) return;
    
    try {
      await onDocumentUpload(stage, documentType, selectedFile);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const getStageStatus = (stage: ApplicantStage) => {
    const stageIndex = stages.indexOf(stage);
    const currentIndex = stages.indexOf(currentStage);

    if (stageIndex < currentIndex) {
      return 'completed';
    } else if (stageIndex === currentIndex) {
      return 'current';
    }
    return 'upcoming';
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = uploadedDocuments[documentType];
    if (!doc) return 'missing';
    return doc.status;
  };

  const renderDocumentStatus = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return (
          <div className="h-5 w-5 rounded-full border-2 border-yellow-500"></div>
        );
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Pipeline Progress */}
      <div className="relative">
        <div
          className="absolute inset-0 flex items-center"
          aria-hidden="true"
        >
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage);
            return (
              <div
                key={stage}
                className={`flex flex-col items-center ${
                  index === stages.length - 1 ? '' : 'flex-1'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      getStageColor(status)
                    } text-white text-sm font-medium`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {stage}
                  </div>
                  {status === 'current' && !isUpdating && (
                    <button
                      type="button"
                      onClick={() => handleStageUpdate(stages[index + 1])}
                      className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Complete & Move
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Required Documents for {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)} Stage
          </h3>
          <div className="mt-4 space-y-4">
            {requiredDocuments[currentStage]?.map((documentType) => (
              <div
                key={documentType}
                className="flex items-center justify-between border-t border-gray-200 pt-4"
              >
                <div className="flex items-center">
                  {renderDocumentStatus(getDocumentStatus(documentType))}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {documentType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
                <div>
                  <input
                    type="file"
                    className="sr-only"
                    id={`file-upload-${documentType}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                  <label
                    htmlFor={`file-upload-${documentType}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Upload
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => handleFileUpload(currentStage, documentType)}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline History */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Pipeline History
          </h3>
          <div className="mt-4 flow-root">
            <ul role="list" className="-mb-8">
              {pipelineHistory.map((item, index) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {index < pipelineHistory.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            item.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-gray-400'
                          }`}
                        >
                          <CheckCircleIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Moved to{' '}
                            <span className="font-medium text-gray-900 capitalize">
                              {item.stage}
                            </span>{' '}
                            stage
                          </p>
                          {item.notes && (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={item.enteredDate.toISOString()}>
                            {new Date(item.enteredDate).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
