"use client";

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeDisplayProps {
  value: string;
  type?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function BarcodeDisplay({ 
  value, 
  type = 'EAN13', 
  width = 120, 
  height = 40, 
  className = '' 
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        // Clear previous barcode
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        // Generate barcode
        JsBarcode(canvasRef.current, value, {
          format: type,
          width: 2,
          height: height,
          displayValue: false,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 2
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
        // If barcode generation fails, we'll show the error state
      }
    }
  }, [value, type, height]);

  if (!value) {
    return (
      <div className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded ${className}`}>
        <span className="text-xs text-gray-400">No barcode</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border rounded bg-white ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
