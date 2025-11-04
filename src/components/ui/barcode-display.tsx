"use client";

import React, { useEffect, useRef, useState } from 'react';

interface BarcodeDisplayProps {
  value: string;
  type?: string;
  width?: number;
  height?: number;
  className?: string;
}

// Valid barcode formats supported by JsBarcode
const VALID_FORMATS = [
  'CODE128',
  'CODE128A',
  'CODE128B',
  'CODE128C',
  'CODE39',
  'EAN13',
  'EAN8',
  'UPC',
  'ITF14',
  'MSI',
  'MSI10',
  'MSI11',
  'MSI1010',
  'MSI1110',
  'pharmacode',
  'codabar'
];

export function BarcodeDisplay({ 
  value, 
  type = 'EAN13', 
  width = 120, 
  height = 40, 
  className = '' 
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      // Dynamically import JsBarcode on the client side
      import('jsbarcode').then((JsBarcode) => {
        try {
          // Validate format
          const format = VALID_FORMATS.includes(type.toUpperCase()) 
            ? type.toUpperCase() 
            : 'CODE128'; // Fallback to CODE128 if format is invalid
          
          if (format !== type.toUpperCase()) {
            console.warn(`Invalid barcode format "${type}", using CODE128 instead`);
          }

          // Clear previous barcode
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          // Generate barcode
          if (canvasRef.current) {
            const JsBarcodeDefault = JsBarcode.default || JsBarcode;
            JsBarcodeDefault(canvasRef.current, value, {
              format: format,
              width: 2,
              height: height,
              displayValue: false,
              background: '#ffffff',
              lineColor: '#000000',
              margin: 2
            });
            setError(null);
          }
        } catch (err) {
          console.error('Error generating barcode:', err);
          setError(err instanceof Error ? err.message : 'Failed to generate barcode');
        }
      }).catch((err) => {
        console.error('Error loading JsBarcode:', err);
        setError('Failed to load barcode library');
      });
    }
  }, [value, type, height]);

  if (!value) {
    return (
      <div className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded ${className}`}>
        <span className="text-xs text-gray-400">No barcode</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center border-2 border-dashed border-red-300 rounded ${className}`}>
        <span className="text-xs text-red-400">Barcode error</span>
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
