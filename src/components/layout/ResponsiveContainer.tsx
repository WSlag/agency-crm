import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centered?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  'full': 'max-w-full'
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = true,
  centered = true,
}) => {
  return (
    <div
      className={`
        w-full
        ${maxWidthClasses[maxWidth]}
        ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
        ${centered ? 'mx-auto' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { default: 1 },
  gap = 4,
}) => {
  const getGridCols = () => {
    const gridCols = [];
    gridCols.push(`grid-cols-${cols.default}`);
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
    return gridCols.join(' ');
  };

  return (
    <div
      className={`
        grid
        ${getGridCols()}
        gap-${gap}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  reverse?: boolean;
  spacing?: number;
  wrap?: boolean;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className = '',
  direction = 'col',
  reverse = false,
  spacing = 4,
  wrap = false,
}) => {
  const getFlexDirection = () => {
    if (direction === 'row') {
      return reverse ? 'flex-row-reverse' : 'flex-row';
    }
    return reverse ? 'flex-col-reverse' : 'flex-col';
  };

  return (
    <div
      className={`
        flex
        ${getFlexDirection()}
        ${wrap ? 'flex-wrap' : ''}
        ${direction === 'row' ? `space-x-${spacing}` : `space-y-${spacing}`}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
