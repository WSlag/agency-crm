import { z } from 'zod';

// Get environment variables
const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) * 1024 * 1024 || 10 * 1024 * 1024; // Default 10MB
const MAX_FILES = Number(import.meta.env.VITE_MAX_FILES_PER_UPLOAD) || 5; // Default 5 files
const ALLOWED_FILE_TYPES = import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || 
  ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];

// File validation schema
export const fileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number().max(MAX_FILE_SIZE, `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
});

export const fileArraySchema = z.array(fileSchema).max(MAX_FILES, `Maximum ${MAX_FILES} files allowed`);

// File validation utility functions
export const fileValidation = {
  /**
   * Validates a single file
   */
  validateFile: (file: File): { valid: boolean; error?: string } => {
    try {
      // Validate file extension
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(extension)) {
        return {
          valid: false,
          error: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
        };
      }

      // Validate file using schema
      fileSchema.parse(file);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0].message };
      }
      return { valid: false, error: 'Invalid file' };
    }
  },

  /**
   * Validates multiple files
   */
  validateFiles: (files: FileList): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const filesArray = Array.from(files);

    // Check number of files
    if (filesArray.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed`);
      return { valid: false, errors };
    }

    // Validate each file
    filesArray.forEach((file, index) => {
      const result = fileValidation.validateFile(file);
      if (!result.valid && result.error) {
        errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
      }
    });

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validates file MIME type
   */
  validateMimeType: (file: File, allowedMimes: string[]): boolean => {
    return allowedMimes.includes(file.type);
  },

  /**
   * Gets safe file extension
   */
  getSafeFileExtension: (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return ALLOWED_FILE_TYPES.includes(`.${extension}`) ? extension : '';
  },

  /**
   * Generates safe filename
   */
  getSafeFilename: (filename: string): string => {
    // Remove special characters and spaces
    const safeName = filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_');
    
    const extension = fileValidation.getSafeFileExtension(filename);
    const nameWithoutExtension = safeName.replace(new RegExp(`\\.${extension}$`), '');
    
    // Add timestamp to ensure uniqueness
    return `${nameWithoutExtension}_${Date.now()}.${extension}`;
  }
};

// Export constants for use in other files
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_FILE_TYPES,
} as const;
