import React from 'react';

const SkeletonEmailList: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="flex flex-col gap-2 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg h-16 p-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonEmailList;
