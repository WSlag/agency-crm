import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className = '',
  maxCount = 99
}) => {
  if (count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[1.25rem] h-5
        px-1.5 py-0.5
        text-xs font-medium
        bg-red-100 text-red-800
        rounded-full
        ${className}
      `}
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </span>
  );
};
