import { firestore, storage } from '../../config/firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface BackupConfig {
  collections: string[];
  retentionDays: number;
  includeFiles: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  collections: string[];
  size: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export class BackupService {
  private readonly backupsRef = collection(firestore, 'backups');

  async createBackup(config: BackupConfig): Promise<string> {
    try {
      // Create backup metadata
      const backupRef = doc(this.backupsRef);
      const backupId = backupRef.id;
      const timestamp = new Date();

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        collections: config.collections,
        size: 0,
        status: 'pending',
      };

      await setDoc(backupRef, metadata);

      // Backup each collection
      const backupData: Record<string, any[]> = {};
      let totalSize = 0;

      for (const collectionName of config.collections) {
        const collectionRef = collection(firestore, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        backupData[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        totalSize += JSON.stringify(backupData[collectionName]).length;
      }

      // Upload backup data to storage
      const backupRef = ref(storage, `backups/${backupId}/data.json`);
      await uploadBytes(backupRef, new Blob([JSON.stringify(backupData)]));

      // If includeFiles is true, backup files from storage
      if (config.includeFiles) {
        await this.backupFiles(backupId);
      }

      // Update backup metadata
      await updateDoc(doc(this.backupsRef, backupId), {
        status: 'completed',
        size: totalSize,
        completedAt: new Date(),
      });

      // Clean up old backups
      await this.cleanupOldBackups(config.retentionDays);

      return backupId;
    } catch (error) {
      console.error('Backup failed:', error);
      
      if (backupId) {
        await updateDoc(doc(this.backupsRef, backupId), {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      throw new Error('Failed to create backup');
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    try {
      // Get backup metadata
      const backupDoc = await getDoc(doc(this.backupsRef, backupId));
      if (!backupDoc.exists()) {
        throw new Error('Backup not found');
      }

      const backup = backupDoc.data() as BackupMetadata;
      if (backup.status !== 'completed') {
        throw new Error('Cannot restore incomplete backup');
      }

      // Download backup data
      const backupRef = ref(storage, `backups/${backupId}/data.json`);
      const url = await getDownloadURL(backupRef);
      const response = await fetch(url);
      const backupData = await response.json();

      // Restore each collection
      const batch = writeBatch(firestore);
      
      for (const [collectionName, documents] of Object.entries(backupData)) {
        for (const doc of documents) {
          const { id, ...data } = doc;
          batch.set(doc(collection(firestore, collectionName), id), data);
        }
      }

      await batch.commit();

      // Restore files if they were backed up
      const filesRef = ref(storage, `backups/${backupId}/files`);
      try {
        const filesList = await listAll(filesRef);
        for (const fileRef of filesList.items) {
          const fileName = fileRef.name;
          const targetRef = ref(storage, fileName);
          await copyObject(fileRef, targetRef);
        }
      } catch (error) {
        console.warn('No files to restore or error restoring files:', error);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error('Failed to restore backup');
    }
  }

  private async backupFiles(backupId: string): Promise<void> {
    try {
      const filesRef = ref(storage);
      const filesList = await listAll(filesRef);

      for (const fileRef of filesList.items) {
        // Skip backup files
        if (fileRef.fullPath.startsWith('backups/')) {
          continue;
        }

        const targetRef = ref(storage, `backups/${backupId}/files/${fileRef.fullPath}`);
        await copyObject(fileRef, targetRef);
      }
    } catch (error) {
      console.error('Failed to backup files:', error);
      throw error;
    }
  }

  private async cleanupOldBackups(retentionDays: number): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const oldBackupsQuery = query(
        this.backupsRef,
        where('timestamp', '<', cutoffDate),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(oldBackupsQuery);

      for (const doc of snapshot.docs) {
        const backupId = doc.id;

        // Delete backup data
        const dataRef = ref(storage, `backups/${backupId}/data.json`);
        await deleteObject(dataRef);

        // Delete backup files
        const filesRef = ref(storage, `backups/${backupId}/files`);
        try {
          const filesList = await listAll(filesRef);
          for (const fileRef of filesList.items) {
            await deleteObject(fileRef);
          }
        } catch (error) {
          console.warn('No files to delete or error deleting files:', error);
        }

        // Delete backup metadata
        await deleteDoc(doc.ref);
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
      throw error;
    }
  }
}
