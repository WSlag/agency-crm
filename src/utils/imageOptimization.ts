import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

interface ImageDimensions {
  width: number;
  height: number;
}

export const imageOptimization = {
  /**
   * Get image dimensions
   */
  getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Compress image before upload
   */
  async compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Upload image with optimization
   */
  async uploadOptimizedImage(
    file: File,
    path: string,
    options = { maxWidth: 1200, quality: 0.8 }
  ): Promise<string> {
    try {
      // Compress image
      const compressedBlob = await this.compressImage(
        file,
        options.maxWidth,
        options.quality
      );

      // Create optimized file
      const optimizedFile = new File([compressedBlob], file.name, {
        type: file.type,
      });

      // Upload to Firebase Storage
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, optimizedFile, {
        contentType: file.type,
        customMetadata: {
          originalSize: file.size.toString(),
          optimizedSize: optimizedFile.size.toString(),
        },
      });

      // Get download URL
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading optimized image:', error);
      throw error;
    }
  },

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    file: File,
    maxWidth = 200,
    quality = 0.6
  ): Promise<Blob> {
    return this.compressImage(file, maxWidth, quality);
  },
};
