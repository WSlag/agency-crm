import React, { useState, useEffect } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../config/firebase';
import LoadingSpinner from './LoadingSpinner';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        
        // If src is a Firebase Storage path
        if (src.startsWith('gs://') || src.startsWith('/')) {
          const storageRef = ref(storage, src);
          const url = await getDownloadURL(storageRef);
          setImageUrl(url);
        } else {
          // If src is already a URL
          setImageUrl(src);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        onError?.(err as Error);
      }
    };

    loadImage();
  }, [src, onError]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const error = new Error(`Failed to load image: ${src}`);
    setError(error);
    onError?.(error);
  };

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner size="small" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'invisible' : 'visible'}`}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default OptimizedImage;
