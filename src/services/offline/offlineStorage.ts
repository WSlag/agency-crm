import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineFormData {
  id: string;
  formType: 'document' | 'transfer' | 'expense';
  data: any;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  lastModified: Date;
  retryCount: number;
  error?: string;
}

interface OfflineDB extends DBSchema {
  forms: {
    key: string;
    value: OfflineFormData;
    indexes: {
      'by-status': string;
      'by-type': string;
      'by-date': Date;
    };
  };
}

export class OfflineStorage {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private readonly DB_NAME = 'recruitment_agency_offline';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    try {
      this.db = await openDB<OfflineDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          const formStore = db.createObjectStore('forms', { keyPath: 'id' });
          formStore.createIndex('by-status', 'status');
          formStore.createIndex('by-type', 'formType');
          formStore.createIndex('by-date', 'lastModified');
        },
      });
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      throw new Error('Failed to initialize offline storage');
    }
  }

  async saveForm(formData: Omit<OfflineFormData, 'id' | 'status' | 'lastModified' | 'retryCount'>): Promise<string> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const id = crypto.randomUUID();
      const offlineForm: OfflineFormData = {
        id,
        ...formData,
        status: 'pending',
        lastModified: new Date(),
        retryCount: 0,
      };

      await this.db!.add('forms', offlineForm);
      return id;
    } catch (error) {
      console.error('Failed to save form offline:', error);
      throw new Error('Failed to save form offline');
    }
  }

  async getPendingForms(): Promise<OfflineFormData[]> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      return await this.db!.getAllFromIndex('forms', 'by-status', 'pending');
    } catch (error) {
      console.error('Failed to get pending forms:', error);
      throw new Error('Failed to get pending forms');
    }
  }

  async updateFormStatus(id: string, status: OfflineFormData['status'], error?: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const form = await this.db!.get('forms', id);
      if (!form) {
        throw new Error('Form not found');
      }

      await this.db!.put('forms', {
        ...form,
        status,
        lastModified: new Date(),
        retryCount: status === 'error' ? form.retryCount + 1 : form.retryCount,
        error: error,
      });
    } catch (error) {
      console.error('Failed to update form status:', error);
      throw new Error('Failed to update form status');
    }
  }

  async deleteForm(id: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      await this.db!.delete('forms', id);
    } catch (error) {
      console.error('Failed to delete form:', error);
      throw new Error('Failed to delete form');
    }
  }

  async getFormsByType(type: OfflineFormData['formType']): Promise<OfflineFormData[]> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      return await this.db!.getAllFromIndex('forms', 'by-type', type);
    } catch (error) {
      console.error('Failed to get forms by type:', error);
      throw new Error('Failed to get forms by type');
    }
  }

  async clearSyncedForms(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const syncedForms = await this.db!.getAllFromIndex('forms', 'by-status', 'synced');
      await Promise.all(syncedForms.map(form => this.deleteForm(form.id)));
    } catch (error) {
      console.error('Failed to clear synced forms:', error);
      throw new Error('Failed to clear synced forms');
    }
  }
}
