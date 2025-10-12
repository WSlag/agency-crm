import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
  className?: string;
  onBack?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath = '/',
  label = 'Back',
  className = '',
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  // Don't show back button on the main dashboard
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${className}
      `}
    >
      <ArrowLeftIcon className="mr-1 h-5 w-5" aria-hidden="true" />
      {label}
    </button>
  );
};
