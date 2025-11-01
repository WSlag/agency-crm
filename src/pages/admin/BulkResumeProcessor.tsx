import React, { useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { firestore as db } from '../../config/firebase';
import { Applicant } from '../../types/applicant';
import {
  isApplicantReadyForPortal,
  getMissingPhotos,
  notifyReadyForApproval,
  notifyMissingPhotos,
} from '../../utils/resumeApprovalHelpers';

interface ProcessingResult {
  totalProcessed: number;
  setPending: number;
  needsPhotos: number;
  alreadyProcessed: number;
  errors: string[];
}

export const BulkResumeProcessor: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const processExistingApplicants = async () => {
    if (!confirm('This will scan all medical-passed applicants and auto-set pending approval status where applicable. Continue?')) {
      return;
    }

    setProcessing(true);
    setResult(null);
    setLogs([]);
    addLog('Starting bulk processing...');

    const results: ProcessingResult = {
      totalProcessed: 0,
      setPending: 0,
      needsPhotos: 0,
      alreadyProcessed: 0,
      errors: [],
    };

    try {
      // Query all applicants with medical passed
      const applicantsRef = collection(db, 'applicants');
      const q = query(
        applicantsRef,
        where('medicalStatus.examination.result', '==', 'passed'),
        where('status', '==', 'active')
      );

      addLog('Querying medical-passed applicants...');
      const querySnapshot = await getDocs(q);
      addLog(`Found ${querySnapshot.size} medical-passed applicants`);

      // Process each applicant
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const applicant: Applicant = {
          id: docSnapshot.id,
          ...data,
          dateOfBirth: data.dateOfBirth?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          medicalStatus: {
            ...data.medicalStatus,
            examination: {
              ...data.medicalStatus.examination,
              date: data.medicalStatus.examination.date?.toDate() || null,
            },
          },
        } as Applicant;

        results.totalProcessed++;

        try {
          // Check if already has approval status
          if (applicant.resumeApprovalStatus) {
            addLog(`⏭️  ${applicant.fullName}: Already has approval status (${applicant.resumeApprovalStatus})`);
            results.alreadyProcessed++;
            continue;
          }

          // Check if ready for portal
          if (isApplicantReadyForPortal(applicant)) {
            addLog(`✅ ${applicant.fullName}: Ready for approval - setting to pending`);

            // Update to pending
            const applicantRef = doc(db, 'applicants', applicant.id);
            await updateDoc(applicantRef, {
              resumeApprovalStatus: 'pending',
              updatedAt: Timestamp.now(),
            });

            // Send notification
            await notifyReadyForApproval(applicant);

            results.setPending++;
          } else {
            // Check if missing photos
            const missingPhotos = getMissingPhotos(applicant);
            if (missingPhotos.length > 0) {
              addLog(`⚠️  ${applicant.fullName}: Missing photos - ${missingPhotos.join(', ')}`);

              // Send notification about missing photos
              await notifyMissingPhotos(applicant);

              results.needsPhotos++;
            }
          }
        } catch (error) {
          const errorMsg = `Error processing ${applicant.fullName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          addLog(`❌ ${errorMsg}`);
          results.errors.push(errorMsg);
        }
      }

      addLog('✅ Bulk processing completed!');
      setResult(results);
    } catch (error) {
      const errorMsg = `Fatal error during bulk processing: ${error instanceof Error ? error.message : 'Unknown error'}`;
      addLog(`❌ ${errorMsg}`);
      results.errors.push(errorMsg);
      setResult(results);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bulk Resume Processor
          </h1>
          <p className="text-gray-600">
            Process existing applicants to auto-set pending approval status for those who are ready
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What this tool does:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Scans all applicants who passed medical examination</li>
            <li>• Checks if they have all 3 required photos uploaded</li>
            <li>• Auto-sets <code className="bg-blue-100 px-1 rounded">resumeApprovalStatus</code> to "pending" if ready</li>
            <li>• Sends notifications to admins for approval or photo upload</li>
            <li>• Skips applicants who already have an approval status</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={processExistingApplicants}
            disabled={processing}
            className={`px-6 py-3 rounded-lg font-semibold ${
              processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {processing ? 'Processing...' : 'Start Bulk Processing'}
          </button>
        </div>

        {/* Results Summary */}
        {result && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Processing Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded p-3">
                <div className="text-2xl font-bold text-gray-900">{result.totalProcessed}</div>
                <div className="text-sm text-gray-600">Total Processed</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-2xl font-bold text-green-600">{result.setPending}</div>
                <div className="text-sm text-gray-600">Set to Pending</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-2xl font-bold text-orange-600">{result.needsPhotos}</div>
                <div className="text-sm text-gray-600">Needs Photos</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-2xl font-bold text-gray-600">{result.alreadyProcessed}</div>
                <div className="text-sm text-gray-600">Already Processed</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-semibold text-red-900 mb-2">
                  Errors ({result.errors.length})
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {result.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Processing Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 overflow-hidden">
            <h3 className="font-semibold text-white mb-2">Processing Log</h3>
            <div className="bg-black rounded p-3 max-h-96 overflow-y-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {logs.join('\n')}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
