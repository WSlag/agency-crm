import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';

interface PageTransitionProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  className?: string;
}

export const PageTransition = React.memo<PageTransitionProps>(({
  children,
  isLoading = false,
  loadingMessage,
  className = '',
}) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`min-h-[200px] flex flex-col items-center justify-center ${className}`}
        >
          <LoadingSpinner size="large" />
          {loadingMessage && (
            <p className="mt-4 text-sm text-gray-600">{loadingMessage}</p>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});