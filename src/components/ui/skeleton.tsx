"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = true 
}: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${rounded ? 'rounded' : ''} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Card skeleton for main content areas
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border ${className}`}>
      <div className="space-y-4">
        <Skeleton height="1.5rem" width="80%" />
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="1rem" width="40%" />
      </div>
    </div>
  );
}

// Table skeleton
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Table header */}
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="1rem" width="20%" />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height="1rem" width="20%" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sidebar skeleton
export function SkeletonSidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6 space-y-6">
        {/* Logo area */}
        <div className="space-y-2">
          <Skeleton height="2rem" width="80%" />
          <Skeleton height="1rem" width="60%" />
        </div>
        
        {/* Navigation items */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton height="1.25rem" width="1.25rem" rounded />
              <Skeleton height="1rem" width="70%" />
            </div>
          ))}
        </div>
        
        {/* User section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Skeleton height="2.5rem" width="2.5rem" rounded />
            <div className="space-y-1">
              <Skeleton height="1rem" width="80%" />
              <Skeleton height="0.75rem" width="60%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric card skeleton
export function SkeletonMetricCard() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="space-y-3">
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="2rem" width="40%" />
        <div className="flex items-center space-x-2">
          <Skeleton height="1rem" width="1rem" rounded />
          <Skeleton height="0.875rem" width="30%" />
        </div>
      </div>
    </div>
  );
}

// Chart skeleton
export function SkeletonChart({ height = '300px' }: { height?: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="space-y-4">
        <Skeleton height="1.5rem" width="40%" />
        <div 
          className="bg-gray-100 rounded"
          style={{ height }}
        >
          <div className="flex items-end justify-between h-full p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton 
                key={i} 
                height={`${Math.random() * 60 + 20}%`} 
                width="12%" 
                rounded={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// List skeleton
export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-4">
            <Skeleton height="2.5rem" width="2.5rem" rounded />
            <div className="flex-1 space-y-2">
              <Skeleton height="1rem" width="70%" />
              <Skeleton height="0.875rem" width="50%" />
            </div>
            <Skeleton height="1.5rem" width="4rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Form skeleton
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton height="1rem" width="25%" />
            <Skeleton height="2.5rem" width="100%" />
          </div>
        ))}
        <div className="flex space-x-3 pt-4">
          <Skeleton height="2.5rem" width="6rem" />
          <Skeleton height="2.5rem" width="6rem" />
        </div>
      </div>
    </div>
  );
}
