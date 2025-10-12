import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export const PageTransition = ({
  children,
  isLoading = false,
  loadingText = 'Loading...'
}: PageTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-[200px] flex flex-col items-center justify-center"
        >
          <LoadingSpinner size="large" />
          {loadingText && (
            <p className="mt-4 text-sm text-gray-600">{loadingText}</p>
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
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
