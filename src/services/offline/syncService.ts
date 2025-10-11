import { OfflineStorage } from './offlineStorage';
import { DocumentService } from '../documents/documentService';
import { TransferService } from '../branch/transferService';
import { ExpenseService } from '../financial/expenseService';

export interface SyncConfig {
  syncInterval: number; // milliseconds
  maxRetries: number;
  batchSize: number;
}

export class SyncService {
  private offlineStorage: OfflineStorage;
  private documentService: DocumentService;
  private transferService: TransferService;
  private expenseService: ExpenseService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  constructor(
    private config: SyncConfig = {
      syncInterval: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      batchSize: 10,
    }
  ) {
    this.offlineStorage = new OfflineStorage();
    this.documentService = new DocumentService();
    this.transferService = new TransferService();
    this.expenseService = new ExpenseService();
  }

  async startSync(): Promise<void> {
    if (this.syncInterval) {
      return;
    }

    await this.offlineStorage.initialize();
    await this.syncPendingForms();

    this.syncInterval = setInterval(async () => {
      await this.syncPendingForms();
    }, this.config.syncInterval);
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncPendingForms(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    try {
      this.isSyncing = true;
      const pendingForms = await this.offlineStorage.getPendingForms();
      
      // Process forms in batches
      for (let i = 0; i < pendingForms.length; i += this.config.batchSize) {
        const batch = pendingForms.slice(i, i + this.config.batchSize);
        await Promise.all(batch.map(form => this.syncForm(form)));
      }

      // Clean up synced forms
      await this.offlineStorage.clearSyncedForms();
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncForm(form: any): Promise<void> {
    try {
      await this.offlineStorage.updateFormStatus(form.id, 'syncing');

      switch (form.formType) {
        case 'document':
          await this.syncDocument(form);
          break;
        case 'transfer':
          await this.syncTransfer(form);
          break;
        case 'expense':
          await this.syncExpense(form);
          break;
        default:
          throw new Error(`Unknown form type: ${form.formType}`);
      }

      await this.offlineStorage.updateFormStatus(form.id, 'synced');
    } catch (error) {
      console.error(`Error syncing form ${form.id}:`, error);
      
      if (form.retryCount >= this.config.maxRetries) {
        await this.offlineStorage.updateFormStatus(
          form.id,
          'error',
          error instanceof Error ? error.message : 'Sync failed'
        );
      } else {
        await this.offlineStorage.updateFormStatus(form.id, 'pending');
      }
    }
  }

  private async syncDocument(form: any): Promise<void> {
    const { file, metadata } = form.data;
    await this.documentService.uploadDocument(file, metadata);
  }

  private async syncTransfer(form: any): Promise<void> {
    await this.transferService.initiateTransfer(form.data);
  }

  private async syncExpense(form: any): Promise<void> {
    await this.expenseService.submitExpense(form.data);
  }

  // Public methods for manual sync operations
  async forceSyncAll(): Promise<void> {
    await this.syncPendingForms();
  }

  async syncById(formId: string): Promise<void> {
    const form = await this.offlineStorage.getPendingForms();
    const targetForm = form.find(f => f.id === formId);
    if (targetForm) {
      await this.syncForm(targetForm);
    }
  }

  async getFailedSyncs(): Promise<any[]> {
    const allForms = await this.offlineStorage.getPendingForms();
    return allForms.filter(form => form.status === 'error');
  }
}
