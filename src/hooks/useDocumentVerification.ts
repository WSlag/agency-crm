import { useState, useEffect } from 'react';
import { documentVerificationService, Document } from '../services/DocumentVerificationService';
import { useAuth } from '../contexts/AuthContext';

export const useDocumentVerification = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, customClaims } = useAuth();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const branchId = customClaims?.role === 'branch_manager' ? customClaims.branchId : undefined;
        const docs = await documentVerificationService.getPendingDocuments(branchId);
        setDocuments(docs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [customClaims]);

  const verifyDocument = async (
    documentId: string,
    approved: boolean,
    rejectionReason?: string
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await documentVerificationService.verifyDocument(
        documentId,
        user.uid,
        approved,
        rejectionReason
      );

      // Update local state
      setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to verify document');
    }
  };

  return {
    documents,
    selectedDocument,
    setSelectedDocument,
    loading,
    error,
    verifyDocument
  };
};
