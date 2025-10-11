'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import { Download, Printer, Copy } from 'lucide-react';
import { useToast } from '@/contexts/toast-context';

interface BarcodeDisplayProps {
  value: string;
  format?: 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39' | 'UPC' | 'ITF14';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  showActions?: boolean;
  productName?: string;
  productSku?: string;
  price?: number;
}

export function BarcodeDisplay({
  value,
  format = 'EAN13',
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 20,
  showActions = true,
  productName,
  productSku,
  price
}: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const { addToast } = useToast();
  
  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: format === 'UPC' ? 'UPC' : format,
          width,
          height,
          displayValue,
          fontSize,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000'
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value, format, width, height, displayValue, fontSize]);
  
  const handleDownload = () => {
    if (!barcodeRef.current) return;
    
    try {
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `barcode-${value}.png`;
        downloadLink.click();
        
        addToast('Barcode downloaded', 'success');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading barcode:', error);
      addToast('Failed to download barcode', 'error');
    }
  };
  
  const handlePrint = () => {
    if (!barcodeRef.current) return;
    
    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
              }
              .product-info {
                text-align: center;
                margin-bottom: 10px;
              }
              .product-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 4px;
              }
              .product-sku {
                font-size: 12px;
                color: #666;
                margin-bottom: 4px;
              }
              .product-price {
                font-size: 16px;
                font-weight: bold;
                color: #000;
              }
              svg {
                display: block;
                margin: 10px auto;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${productName || productSku || price ? `
              <div class="product-info">
                ${productName ? `<div class="product-name">${productName}</div>` : ''}
                ${productSku ? `<div class="product-sku">SKU: ${productSku}</div>` : ''}
                ${price ? `<div class="product-price">GHS ${price.toFixed(2)}</div>` : ''}
              </div>
            ` : ''}
            ${barcodeRef.current.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      addToast('Printing barcode...', 'success');
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    addToast('Barcode copied to clipboard', 'success');
  };
  
  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-white">
      {(productName || productSku || price) && (
        <div className="text-center space-y-1">
          {productName && <div className="font-semibold text-sm">{productName}</div>}
          {productSku && <div className="text-xs text-gray-600">SKU: {productSku}</div>}
          {price && <div className="text-lg font-bold">GHS {price.toFixed(2)}</div>}
        </div>
      )}
      
      <svg ref={barcodeRef}></svg>
      
      {showActions && (
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      )}
    </div>
  );
}

