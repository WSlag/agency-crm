import React from 'react';

interface SkipLinkProps {
  mainContentId: string;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  mainContentId,
  className = ''
}) => {
  return (
    <a
      href={`#${mainContentId}`}
      className={`
        sr-only focus:not-sr-only
        focus:fixed focus:top-0 focus:left-0
        focus:z-50 focus:p-4
        focus:bg-white focus:text-primary-700
        focus:outline-none focus:ring-2 focus:ring-primary-500
        ${className}
      `}
    >
      Skip to main content
    </a>
  );
};
