import React from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`
        inline-flex items-center gap-x-2 rounded-md 
        bg-white px-3 py-2 text-sm font-semibold 
        text-gray-900 shadow-sm ring-1 ring-inset 
        ring-gray-300 hover:bg-gray-50
        ${className}
      `}
    >
      <ArrowLeftIcon
        className="-ml-0.5 h-5 w-5 text-gray-400"
        aria-hidden="true"
      />
      {label}
    </button>
  );
};