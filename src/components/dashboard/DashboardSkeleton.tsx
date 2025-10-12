import React from 'react';

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="mt-4 h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);
