import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export interface Template {
  id: string;
  name: string;
  description?: string;
  documentType: string;
  isActive: boolean;
  requiredFields: {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  documentType: string;
  isActive: boolean;
  requiredFields: {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
  }[];
}

class TemplateService {
  private collection = collection(firestore, 'templates');

  async getTemplates(): Promise<Template[]> {
    const querySnapshot = await getDocs(this.collection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Template[];
  }

  async getActiveTemplates(): Promise<Template[]> {
    const q = query(this.collection, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Template[];
  }

  async createTemplate(data: CreateTemplateData): Promise<Template> {
    const now = new Date();
    const docRef = await addDoc(this.collection, {
      ...data,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  async updateTemplate(id: string, data: Partial<CreateTemplateData>): Promise<void> {
    const docRef = doc(this.collection, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    const docRef = doc(this.collection, id);
    await deleteDoc(docRef);
  }
}

export const templateService = new TemplateService();