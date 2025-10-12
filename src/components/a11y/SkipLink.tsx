import React from 'react';

interface SkipLinkProps {
  targetId: string;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ targetId, className = '' }) => {
  return (
    <a
      href={`#${targetId}`}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-primary-600 text-white px-4 py-2 rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${className}
      `}
    >
      Skip to main content
    </a>
  );
};
