import { useState, useEffect, useMemo } from 'react';
import { expiryService, ExpiryDocument } from '../services/ExpiryService';

type ExpiryStatus = 'all' | 'expiring_soon' | 'expired';

export const useExpiryDocuments = (branchId?: string | null) => {
  const [documents, setDocuments] = useState<ExpiryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filterStatus, setFilterStatus] = useState<ExpiryStatus>('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const [expiring, expired] = await Promise.all([
          expiryService.getExpiringDocuments(),
          expiryService.getExpiredDocuments()
        ]);

        let filteredDocs = [...expiring, ...expired];
        if (branchId) {
          filteredDocs = filteredDocs.filter(doc => doc.branchId === branchId);
        }

        setDocuments(filteredDocs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [branchId]);

  const filteredDocuments = useMemo(() => {
    switch (filterStatus) {
      case 'expiring_soon':
        return documents.filter(doc => {
          const now = new Date();
          return doc.expiryDate > now;
        });
      case 'expired':
        return documents.filter(doc => {
          const now = new Date();
          return doc.expiryDate <= now;
        });
      default:
        return documents;
    }
  }, [documents, filterStatus]);

  const sendNotification = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    try {
      await expiryService.sendExpiryNotification(document);
      setDocuments(docs =>
        docs.map(doc =>
          doc.id === documentId
            ? { ...doc, notificationSent: true, lastNotificationDate: new Date() }
            : doc
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to send notification');
    }
  };

  return {
    documents: filteredDocuments,
    loading,
    error,
    filterStatus,
    setFilterStatus,
    sendNotification
  };
};
