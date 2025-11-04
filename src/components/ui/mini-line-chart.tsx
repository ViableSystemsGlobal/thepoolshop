'use client';

import { useState, useEffect } from 'react';

interface MiniLineChartProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export function MiniLineChart({ 
  data, 
  color, 
  width = 80, 
  height = 24 
}: MiniLineChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render if no data or not on client
  if (!isClient || !data || data.length < 2) {
    return null;
  }

  // Calculate min and max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Prevent division by zero

  // Calculate points for the path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  // Create SVG path
  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-30"
    >
      <path
        d={pathData}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

