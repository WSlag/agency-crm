import { describe, it, expect, beforeEach, vi } from 'vitest';
import { templateService } from '../TemplateService';
import { mockUser, mockTemplate, MockFirestore, MockStorage } from '../../utils/test/mockServices';

describe('TemplateService', () => {
  const mockFirestore = new MockFirestore();
  const mockStorage = new MockStorage();
  
  beforeEach(() => {
    mockFirestore.clearData();
    mockStorage.clearFiles();
    vi.clearAllMocks();
  });

  describe('createTemplate', () => {
    it('creates a template successfully', async () => {
      const template = {
        ...mockTemplate,
        id: undefined
      };

      const id = await templateService.createTemplate(template);
      expect(id).toBeDefined();

      const created = await templateService.getTemplate(id);
      expect(created.name).toBe(template.name);
      expect(created.version).toBe(1);
    });

    it('handles template creation failure', async () => {
      const error = new Error('Failed to create template');
      vi.spyOn(mockFirestore, 'collection').mockImplementationOnce(() => {
        throw error;
      });

      await expect(
        templateService.createTemplate({
          ...mockTemplate,
          id: undefined
        })
      ).rejects.toThrow(error);
    });
  });

  describe('updateTemplate', () => {
    it('updates a template successfully', async () => {
      const template = { ...mockTemplate };
      await mockFirestore.collection('templates').doc(template.id).set(template);

      const updates = {
        name: 'Updated Template',
        description: 'Updated Description'
      };

      await templateService.updateTemplate(template.id, updates);

      const updated = await templateService.getTemplate(template.id);
      expect(updated.name).toBe(updates.name);
      expect(updated.description).toBe(updates.description);
      expect(updated.version).toBe(template.version + 1);
    });

    it('handles template update failure', async () => {
      const error = new Error('Template not found');
      vi.spyOn(mockFirestore, 'collection').mockImplementationOnce(() => {
        throw error;
      });

      await expect(
        templateService.updateTemplate('non-existent', {
          name: 'Updated'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('getTemplate', () => {
    it('retrieves a template successfully', async () => {
      const template = { ...mockTemplate };
      await mockFirestore.collection('templates').doc(template.id).set(template);

      const retrieved = await templateService.getTemplate(template.id);
      expect(retrieved).toEqual(template);
    });

    it('handles template retrieval failure', async () => {
      await expect(
        templateService.getTemplate('non-existent')
      ).rejects.toThrow('Template not found');
    });
  });

  describe('getTemplates', () => {
    it('retrieves templates with filters', async () => {
      const templates = [
        { ...mockTemplate, documentType: 'passport', isActive: true },
        { ...mockTemplate, id: 'template-2', documentType: 'visa', isActive: true },
        { ...mockTemplate, id: 'template-3', documentType: 'passport', isActive: false }
      ];

      for (const template of templates) {
        await mockFirestore.collection('templates').doc(template.id).set(template);
      }

      const filtered = await templateService.getTemplates({
        documentType: 'passport',
        isActive: true
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(mockTemplate.id);
    });
  });

  describe('uploadPreview', () => {
    it('uploads preview image successfully', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const templateId = 'test-template';

      const url = await templateService.uploadPreview(templateId, file);
      expect(url).toContain(templateId);
    });

    it('handles preview upload failure', async () => {
      const error = new Error('Upload failed');
      vi.spyOn(mockStorage, 'ref').mockImplementationOnce(() => {
        throw error;
      });

      await expect(
        templateService.uploadPreview('test-template', new File(['test'], 'test.png'))
      ).rejects.toThrow(error);
    });
  });

  describe('shareTemplate', () => {
    it('shares template with users successfully', async () => {
      const template = { ...mockTemplate, isShared: false };
      await mockFirestore.collection('templates').doc(template.id).set(template);

      const userIds = ['user-1', 'user-2'];
      await templateService.shareTemplate(template.id, userIds);

      const updated = await templateService.getTemplate(template.id);
      expect(updated.isShared).toBe(true);
      expect(updated.sharedWith).toEqual(userIds);
    });

    it('handles template sharing failure', async () => {
      const error = new Error('Failed to share template');
      vi.spyOn(mockFirestore, 'collection').mockImplementationOnce(() => {
        throw error;
      });

      await expect(
        templateService.shareTemplate('non-existent', ['user-1'])
      ).rejects.toThrow(error);
    });
  });
});
