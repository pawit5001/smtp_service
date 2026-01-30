import React from 'react';

const SkeletonEmailContent: React.FC = () => (
  <div className="p-6 animate-pulse bg-white dark:bg-gray-900 rounded-xl">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      ))}
    </div>
  </div>
);

export default SkeletonEmailContent;
