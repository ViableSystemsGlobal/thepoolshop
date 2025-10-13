"use client";

import React from 'react';

interface SkeletonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeletonCount?: number;
}

export function SkeletonLoading({ isLoading, children, skeletonCount = 5 }: SkeletonLoadingProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            {/* Quote number skeleton */}
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            {/* Status badge skeleton */}
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          
          <div className="space-y-3">
            {/* Subject skeleton */}
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            
            {/* Customer info skeleton */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            
            {/* Amount and date skeleton */}
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for table rows
export function SkeletonTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );
}

// Skeleton for metric cards
export function SkeletonMetricCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="mt-4">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}
