import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { firestore, storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedTypes?: string[];
  };
}

export interface Template {
  id?: string;
  name: string;
  description: string;
  documentType: string;
  version: number;
  fields: TemplateField[];
  previewUrl?: string;
  isActive: boolean;
  isShared: boolean;
  sharedWith?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

class TemplateService {
  private static instance: TemplateService;
  private readonly CACHE_KEY = 'templates_cache';
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  private constructor() {}

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  async createTemplate(template: Omit<Template, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newTemplate: Template = {
        ...template,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(firestore, 'templates'), {
        ...newTemplate,
        createdAt: Timestamp.fromDate(newTemplate.createdAt),
        updatedAt: Timestamp.fromDate(newTemplate.updatedAt)
      });

      // Clear cache
      this.clearCache();

      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async updateTemplate(templateId: string, updates: Partial<Template>): Promise<void> {
    try {
      const templateRef = doc(firestore, 'templates', templateId);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        throw new Error('Template not found');
      }

      const currentTemplate = templateDoc.data() as Template;
      const updatedTemplate = {
        ...updates,
        version: currentTemplate.version + 1,
        updatedAt: new Date()
      };

      await updateDoc(templateRef, {
        ...updatedTemplate,
        updatedAt: Timestamp.fromDate(updatedTemplate.updatedAt)
      });

      // Clear cache
      this.clearCache();
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  async getTemplate(templateId: string): Promise<Template> {
    try {
      const templateRef = doc(firestore, 'templates', templateId);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        throw new Error('Template not found');
      }

      const data = templateDoc.data();
      return {
        ...data,
        id: templateDoc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Template;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  async getTemplates(filters?: {
    documentType?: string;
    isActive?: boolean;
    isShared?: boolean;
  }): Promise<Template[]> {
    try {
      // Check cache first
      const cachedTemplates = this.getCachedTemplates();
      if (cachedTemplates) {
        return this.filterTemplates(cachedTemplates, filters);
      }

      // Build query
      let q = collection(firestore, 'templates');
      const conditions = [];

      if (filters?.documentType) {
        conditions.push(where('documentType', '==', filters.documentType));
      }
      if (filters?.isActive !== undefined) {
        conditions.push(where('isActive', '==', filters.isActive));
      }
      if (filters?.isShared !== undefined) {
        conditions.push(where('isShared', '==', filters.isShared));
      }

      conditions.push(orderBy('updatedAt', 'desc'));

      const querySnapshot = await getDocs(query(q, ...conditions));
      const templates = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Template[];

      // Update cache
      this.cacheTemplates(templates);

      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }

  async uploadPreview(templateId: string, file: File): Promise<string> {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `templates/${templateId}/preview_${uuidv4()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Update template with preview URL
      await this.updateTemplate(templateId, { previewUrl: downloadUrl });

      return downloadUrl;
    } catch (error) {
      console.error('Error uploading preview:', error);
      throw error;
    }
  }

  async shareTemplate(templateId: string, userIds: string[]): Promise<void> {
    try {
      const templateRef = doc(firestore, 'templates', templateId);
      await updateDoc(templateRef, {
        isShared: true,
        sharedWith: userIds
      });

      // Clear cache
      this.clearCache();
    } catch (error) {
      console.error('Error sharing template:', error);
      throw error;
    }
  }

  private filterTemplates(templates: Template[], filters?: {
    documentType?: string;
    isActive?: boolean;
    isShared?: boolean;
  }): Template[] {
    if (!filters) return templates;

    return templates.filter(template => {
      if (filters.documentType && template.documentType !== filters.documentType) {
        return false;
      }
      if (filters.isActive !== undefined && template.isActive !== filters.isActive) {
        return false;
      }
      if (filters.isShared !== undefined && template.isShared !== filters.isShared) {
        return false;
      }
      return true;
    });
  }

  private getCachedTemplates(): Template[] | null {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) return null;

    const { templates, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > this.CACHE_DURATION) {
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }

    return templates;
  }

  private cacheTemplates(templates: Template[]): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify({
      templates,
      timestamp: Date.now()
    }));
  }

  private clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
}

export const templateService = TemplateService.getInstance();
