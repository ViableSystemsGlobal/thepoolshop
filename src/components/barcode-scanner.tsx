'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScanLine, Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/toast-context';

interface BarcodeScannerProps {
  onScan: (barcode: string, product?: any) => void;
  onClose?: () => void;
  autoLookup?: boolean;
  title?: string;
  description?: string;
}

export function BarcodeScanner({
  onScan,
  onClose,
  autoLookup = true,
  title = 'Scan Barcode',
  description = 'Use a barcode scanner or manually enter the barcode'
}: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  
  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setBarcode('');
      setScanResult(null);
    }
  }, [isOpen]);
  
  const handleScan = async () => {
    if (!barcode.trim()) {
      addToast('Please enter a barcode', 'error');
      return;
    }
    
    setIsLoading(true);
    setScanResult(null);
    
    try {
      if (autoLookup) {
        const response = await fetch(
          `/api/products/barcode/lookup?barcode=${encodeURIComponent(barcode.trim())}`
        );
        
        if (response.ok) {
          const product = await response.json();
          setScanResult('success');
          addToast(`✓ Found: ${product.name}`, 'success');
          
          // Call parent callback with product data
          onScan(barcode.trim(), product);
          
          // Close dialog after short delay
          setTimeout(() => {
            handleClose();
          }, 500);
        } else {
          const errorData = await response.json();
          setScanResult('error');
          addToast(errorData.error || 'Product not found', 'error');
          
          // Still call parent callback (they can handle not found)
          onScan(barcode.trim(), null);
        }
      } else {
        // Just pass the barcode without lookup
        onScan(barcode.trim());
        handleClose();
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      setScanResult('error');
      addToast('Failed to scan barcode', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleScan();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
        type="button"
      >
        <ScanLine className="h-4 w-4" />
        Scan Barcode
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Scan or type barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  className={`pr-10 ${
                    scanResult === 'success' ? 'border-green-500' :
                    scanResult === 'error' ? 'border-red-500' : ''
                  }`}
                  autoComplete="off"
                />
                {scanResult && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {scanResult === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleScan}
                disabled={isLoading || !barcode.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Scan
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Use a USB/Bluetooth barcode scanner</p>
              <p>• Or manually type the barcode number</p>
              <p>• Press Enter to scan</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact inline version for forms
export function BarcodeInput({
  value,
  onChange,
  onProductFound,
  placeholder = 'Scan or enter barcode',
  disabled = false
}: {
  value: string;
  onChange: (value: string) => void;
  onProductFound?: (product: any) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isLooking, setIsLooking] = useState(false);
  const { addToast } = useToast();
  
  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Auto-lookup when barcode length is typical (8, 12, 13, 14 digits)
    const cleaned = newValue.trim();
    if (/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(cleaned) && onProductFound) {
      lookupBarcode(cleaned);
    }
  };
  
  const lookupBarcode = async (barcode: string) => {
    setIsLooking(true);
    try {
      const response = await fetch(
        `/api/products/barcode/lookup?barcode=${encodeURIComponent(barcode)}`
      );
      
      if (response.ok) {
        const product = await response.json();
        addToast(`✓ Found: ${product.name}`, 'success');
        onProductFound?.(product);
      }
    } catch (error) {
      // Silent fail - user can still manually enter
    } finally {
      setIsLooking(false);
    }
  };
  
  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isLooking}
        className="pr-10"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isLooking ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <ScanLine className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

