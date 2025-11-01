import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { firestore as db } from '../../config/firebase';

export interface ReportTemplate {
  id?: string;
  name: string;
  description: string;
  reportType: string;
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  metrics: Array<{
    name: string;
    calculation: string;
    field: string;
    format: string;
  }>;
  schedule?: {
    frequency: string;
    format: string;
    recipients?: string[];
  };
  createdBy: string;
  organizationId?: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
}

const TEMPLATES_COLLECTION = 'reportTemplates';

/**
 * Create a new report template
 */
export const createTemplate = async (
  template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
): Promise<string> => {
  try {
    const templateData = {
      ...template,
      usageCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, TEMPLATES_COLLECTION),
      templateData
    );
    return docRef.id;
  } catch (error) {
    console.error('Error creating template:', error);
    throw new Error('Failed to create template');
  }
};

/**
 * Get all templates for a user
 */
export const getUserTemplates = async (
  userId: string,
  organizationId?: string
): Promise<ReportTemplate[]> => {
  try {
    let q = query(
      collection(db, TEMPLATES_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    if (organizationId) {
      // Also get organization-wide public templates
      const publicQuery = query(
        collection(db, TEMPLATES_COLLECTION),
        where('organizationId', '==', organizationId),
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc')
      );

      const [userSnapshot, publicSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(publicQuery),
      ]);

      const userTemplates = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ReportTemplate[];

      const publicTemplates = publicSnapshot.docs
        .filter((doc) => doc.data().createdBy !== userId) // Exclude user's own templates
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ReportTemplate[];

      return [...userTemplates, ...publicTemplates];
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ReportTemplate[];
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error('Failed to fetch templates');
  }
};

/**
 * Get a single template by ID
 */
export const getTemplate = async (
  templateId: string
): Promise<ReportTemplate | null> => {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as ReportTemplate;
    }
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw new Error('Failed to fetch template');
  }
};

/**
 * Update a template
 */
export const updateTemplate = async (
  templateId: string,
  updates: Partial<ReportTemplate>
): Promise<void> => {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating template:', error);
    throw new Error('Failed to update template');
  }
};

/**
 * Delete a template
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw new Error('Failed to delete template');
  }
};

/**
 * Increment template usage count
 */
export const incrementTemplateUsage = async (
  templateId: string
): Promise<void> => {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentCount = docSnap.data().usageCount || 0;
      await updateDoc(docRef, {
        usageCount: currentCount + 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Get popular templates (most used)
 */
export const getPopularTemplates = async (
  organizationId?: string,
  limit: number = 10
): Promise<ReportTemplate[]> => {
  try {
    let q = query(
      collection(db, TEMPLATES_COLLECTION),
      where('isPublic', '==', true),
      orderBy('usageCount', 'desc')
    );

    if (organizationId) {
      q = query(
        collection(db, TEMPLATES_COLLECTION),
        where('organizationId', '==', organizationId),
        where('isPublic', '==', true),
        orderBy('usageCount', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs
      .slice(0, limit)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ReportTemplate[];
  } catch (error) {
    console.error('Error fetching popular templates:', error);
    throw new Error('Failed to fetch popular templates');
  }
};

/**
 * Search templates by name or tags
 */
export const searchTemplates = async (
  searchTerm: string,
  userId: string,
  organizationId?: string
): Promise<ReportTemplate[]> => {
  try {
    // Get all user templates first
    const templates = await getUserTemplates(userId, organizationId);

    // Filter by search term
    const lowerSearch = searchTerm.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(lowerSearch) ||
        template.description.toLowerCase().includes(lowerSearch) ||
        template.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch))
    );
  } catch (error) {
    console.error('Error searching templates:', error);
    throw new Error('Failed to search templates');
  }
};

/**
 * Duplicate a template (create a copy)
 */
export const duplicateTemplate = async (
  templateId: string,
  userId: string,
  newName?: string
): Promise<string> => {
  try {
    const template = await getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Create a copy with new name
    const { id, createdAt, updatedAt, usageCount, ...templateData } = template;
    const newTemplate = {
      ...templateData,
      name: newName || `${template.name} (Copy)`,
      createdBy: userId,
      isPublic: false, // Copies are private by default
    };

    return await createTemplate(newTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    throw new Error('Failed to duplicate template');
  }
};

/**
 * Convert a Quick Report configuration to a template
 */
export const createTemplateFromQuickReport = async (
  reportType: string,
  userId: string,
  organizationId?: string
): Promise<string> => {
  // Predefined Quick Report configurations
  const quickReportConfigs: Record<string, Partial<ReportTemplate>> = {
    'transfer-analytics': {
      name: 'Transfer Analytics Template',
      description: 'Analyze branch-to-HQ transfers',
      reportType: 'transfer-analytics',
      filters: [
        {
          field: 'transferDate',
          operator: 'between',
          value: 'this-month',
        },
      ],
      metrics: [
        {
          name: 'Total Transfers',
          calculation: 'count',
          field: '',
          format: 'number',
        },
        {
          name: 'Average Processing Time',
          calculation: 'average',
          field: 'processingTime',
          format: 'number',
        },
      ],
    },
    'officer-performance': {
      name: 'Officer Performance Template',
      description: 'Track recruitment officer metrics',
      reportType: 'officer-performance',
      filters: [
        {
          field: 'createdAt',
          operator: 'between',
          value: 'this-month',
        },
      ],
      metrics: [
        {
          name: 'Total Recruitments',
          calculation: 'sum',
          field: 'recruitmentsCount',
          format: 'number',
        },
        {
          name: 'Total Commission',
          calculation: 'sum',
          field: 'commissionEarned',
          format: 'currency',
        },
      ],
    },
    deployment: {
      name: 'Deployment Reports Template',
      description: 'Track overseas deployments',
      reportType: 'deployment',
      filters: [
        {
          field: 'deploymentDate',
          operator: 'between',
          value: 'this-month',
        },
      ],
      metrics: [
        {
          name: 'Total Deployments',
          calculation: 'count',
          field: '',
          format: 'number',
        },
        {
          name: 'Average Salary',
          calculation: 'average',
          field: 'salary',
          format: 'currency',
        },
      ],
    },
    financial: {
      name: 'Financial Reports Template',
      description: 'Expenses and commissions analysis',
      reportType: 'financial',
      filters: [
        {
          field: 'transactionDate',
          operator: 'between',
          value: 'this-month',
        },
      ],
      metrics: [
        {
          name: 'Total Expenses',
          calculation: 'sum',
          field: 'amount',
          format: 'currency',
        },
        {
          name: 'Total Commission',
          calculation: 'sum',
          field: 'commissionAmount',
          format: 'currency',
        },
      ],
    },
    'branch-performance': {
      name: 'Branch Performance Template',
      description: 'All branch metrics',
      reportType: 'branch-performance',
      filters: [
        {
          field: 'createdAt',
          operator: 'between',
          value: 'this-month',
        },
      ],
      metrics: [
        {
          name: 'Total Revenue',
          calculation: 'sum',
          field: 'totalRevenue',
          format: 'currency',
        },
        {
          name: 'Total Recruitments',
          calculation: 'sum',
          field: 'totalRecruitments',
          format: 'number',
        },
      ],
    },
    'agent-performance': {
      name: 'Agent Performance Template',
      description: 'Agent referral metrics',
      reportType: 'agent-performance',
      filters: [
        {
          field: 'createdAt',
          operator: 'between',
          value: 'this-month',
        },
      ],
      metrics: [
        {
          name: 'Total Referrals',
          calculation: 'sum',
          field: 'totalReferrals',
          format: 'number',
        },
        {
          name: 'Conversion Rate',
          calculation: 'average',
          field: 'conversionRate',
          format: 'percentage',
        },
      ],
    },
  };

  const config = quickReportConfigs[reportType];
  if (!config) {
    throw new Error('Unknown report type');
  }

  return await createTemplate({
    ...config,
    createdBy: userId,
    organizationId,
    isPublic: false,
    tags: ['quick-report', reportType],
  } as Omit<
    ReportTemplate,
    'id' | 'createdAt' | 'updatedAt' | 'usageCount'
  >);
};
