'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText,
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Eye,
  Trash2,
  Package,
  TrendingUp,
  Building
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  name: string;
  sku: string;
  uomBase: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface BulkStockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StockMovementRow {
  id: string;
  rowNumber: number;
  sku: string;
  productName?: string;
  quantity: number;
  type: 'RECEIPT' | 'ADJUSTMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  warehouseCode?: string;
  warehouseName?: string;
  reference?: string;
  reason?: string;
  notes?: string;
  unitCost?: number;
  totalCost?: number;
  errors?: string[];
  isValid?: boolean;
  productId?: string;
  warehouseId?: string;
}

const movementTypes = [
  { value: 'RECEIPT', label: 'Receipt', icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-600' },
  { value: 'ADJUSTMENT', label: 'Adjustment', icon: <Package className="w-4 h-4" />, color: 'text-blue-600' },
  { value: 'TRANSFER_OUT', label: 'Transfer Out', icon: <TrendingUp className="w-4 h-4" />, color: 'text-orange-600' },
  { value: 'TRANSFER_IN', label: 'Transfer In', icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-600' },
];

export function BulkStockMovementModal({ isOpen, onClose, onSuccess }: BulkStockMovementModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  // Helper function to get proper button background classes
  const getButtonBackgroundClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'bg-purple-600 hover:bg-purple-700',
      'blue-600': 'bg-blue-600 hover:bg-blue-700',
      'green-600': 'bg-green-600 hover:bg-green-700',
      'orange-600': 'bg-orange-600 hover:bg-orange-700',
      'red-600': 'bg-red-600 hover:bg-red-700',
      'indigo-600': 'bg-indigo-600 hover:bg-indigo-700',
      'pink-600': 'bg-pink-600 hover:bg-pink-700',
      'teal-600': 'bg-teal-600 hover:bg-teal-700',
    };
    return colorMap[theme.primary] || 'bg-blue-600 hover:bg-blue-700';
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'review' | 'processing' | 'complete'>('upload');
  const [uploadedData, setUploadedData] = useState<StockMovementRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [grnFile, setGrnFile] = useState<File | null>(null);
  const [poFile, setPoFile] = useState<File | null>(null);
  const [processingResults, setProcessingResults] = useState<{
    success: number;
    errors: number;
    details: any[];
  } | null>(null);

  // Load products and warehouses on mount
  React.useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadWarehouses();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'SKU': 'PROD001',
        'Product Name': 'Sample Product',
        'Quantity': 100,
        'Type': 'RECEIPT',
        'Warehouse Code': 'WH001',
        'Reference': 'PO-2024-001',
        'Reason': 'Purchase Order',
        'Notes': 'Bulk receipt from supplier',
        'Unit Cost': 25.50,
        'Total Cost': 2550.00
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Movements');
    
    // Add instructions sheet
    const instructions = [
      { 'Field': 'SKU', 'Required': 'Yes', 'Description': 'Product SKU (must exist in system)' },
      { 'Field': 'Product Name', 'Required': 'No', 'Description': 'Product name (for reference only)' },
      { 'Field': 'Quantity', 'Required': 'Yes', 'Description': 'Quantity to add/subtract (positive for receipts, negative for adjustments)' },
      { 'Field': 'Type', 'Required': 'Yes', 'Description': 'RECEIPT, ADJUSTMENT, TRANSFER_OUT, or TRANSFER_IN' },
      { 'Field': 'Warehouse Code', 'Required': 'Yes', 'Description': 'Warehouse code (must exist in system)' },
      { 'Field': 'Reference', 'Required': 'No', 'Description': 'Reference number (PO, invoice, etc.)' },
      { 'Field': 'Reason', 'Required': 'No', 'Description': 'Reason for movement' },
      { 'Field': 'Notes', 'Required': 'No', 'Description': 'Additional notes' },
      { 'Field': 'Unit Cost', 'Required': 'No', 'Description': 'Unit cost for receipt movements' },
      { 'Field': 'Total Cost', 'Required': 'No', 'Description': 'Total cost (calculated if not provided)' }
    ];
    
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    
    XLSX.writeFile(wb, 'stock-movements-template.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData = jsonData.map((row: any, index: number) => {
          const errors: string[] = [];
          
          // Validate required fields
          if (!row.SKU) errors.push('SKU is required');
          if (!row.Quantity || isNaN(Number(row.Quantity))) errors.push('Valid quantity is required');
          if (!row.Type) errors.push('Type is required');
          if (!row['Warehouse Code']) errors.push('Warehouse Code is required');

          // Validate SKU exists
          const product = products.find(p => p.sku === row.SKU);
          if (!product && row.SKU) errors.push('SKU not found in system');

          // Validate warehouse exists
          const warehouse = warehouses.find(w => w.code === row['Warehouse Code']);
          if (!warehouse && row['Warehouse Code']) errors.push('Warehouse code not found in system');

          // Validate type
          const validTypes = ['RECEIPT', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN'];
          if (row.Type && !validTypes.includes(row.Type)) {
            errors.push('Invalid type. Must be RECEIPT, ADJUSTMENT, TRANSFER_OUT, or TRANSFER_IN');
          }

          return {
            id: `row-${index + 1}`,
            rowNumber: index + 1,
            sku: row.SKU || '',
            productName: row['Product Name'] || '',
            quantity: Number(row.Quantity) || 0,
            type: row.Type || '',
            warehouseCode: row['Warehouse Code'] || '',
            warehouseName: row['Warehouse Name'] || '',
            reference: row.Reference || '',
            reason: row.Reason || '',
            notes: row.Notes || '',
            unitCost: row['Unit Cost'] ? Number(row['Unit Cost']) : undefined,
            totalCost: row['Total Cost'] ? Number(row['Total Cost']) : undefined,
            errors,
            isValid: errors.length === 0,
            productId: product?.id,
            warehouseId: warehouse?.id
          } as StockMovementRow;
        });

        setUploadedData(processedData);
        setStep('review');
      } catch (error) {
        showError('Error reading file');
        console.error('Error processing file:', error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleGrnFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGrnFile(file);
    }
  };

  const handlePoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPoFile(file);
    }
  };

  const updateRowData = (rowId: string, field: keyof StockMovementRow, value: any) => {
    setUploadedData(prev => prev.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value };
        
        // Revalidate the row after update
        const errors: string[] = [];
        
        // Validate required fields
        if (!updatedRow.sku) errors.push('SKU is required');
        if (!updatedRow.quantity || isNaN(Number(updatedRow.quantity))) errors.push('Valid quantity is required');
        if (!updatedRow.type) errors.push('Type is required');
        if (!updatedRow.warehouseCode) errors.push('Warehouse Code is required');

        // Validate SKU exists
        const product = products.find(p => p.sku === updatedRow.sku);
        if (!product && updatedRow.sku) errors.push('SKU not found in system');

        // Validate warehouse exists
        const warehouse = warehouses.find(w => w.code === updatedRow.warehouseCode);
        if (!warehouse && updatedRow.warehouseCode) errors.push('Warehouse code not found in system');

        // Validate type
        const validTypes = ['RECEIPT', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN'];
        if (updatedRow.type && !validTypes.includes(updatedRow.type)) {
          errors.push('Invalid type. Must be RECEIPT, ADJUSTMENT, TRANSFER_OUT, or TRANSFER_IN');
        }

        return {
          ...updatedRow,
          errors,
          isValid: errors.length === 0,
          productId: product?.id,
          warehouseId: warehouse?.id,
          productName: product?.name || updatedRow.productName
        };
      }
      return row;
    }));
  };

  const generateQuickGRN = async () => {
    if (!grnFormData.supplierName || !grnFormData.poNumber || !grnFormData.receivedBy) {
      showError('Please fill in all required fields (Supplier Name, PO Number, Received By)');
      return;
    }

    if (uploadedData.length === 0) {
      showError('No products available to generate GRN');
      return;
    }

    try {
      // Import jsPDF dynamically
      const jsPDF = (await import('jspdf')).default;

      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set up the document
      const pageWidth = 210;
      const pageHeight = 297;
      let yPosition = 20;

      // Add logo if available
      if (customLogo) {
        try {
          const logoResponse = await fetch(customLogo);
          const logoBlob = await logoResponse.blob();
          const logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(logoBlob);
          });
          
          pdf.addImage(logoBase64 as string, 'PNG', 150, 15, 20, 20);
        } catch (error) {
          console.log('Could not load logo:', error);
        }
      }

      // Header - Title (top left)
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GOODS RECEIPT NOTE (GRN)', 20, yPosition);
      yPosition += 20;

      // Supplier and Order Details Section
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Left side details
      pdf.text('SUPPLIER :', 20, yPosition);
      pdf.text(grnFormData.supplierName, 50, yPosition);
      yPosition += 8;
      
      pdf.text('P.O. NO. :', 20, yPosition);
      pdf.text(grnFormData.poNumber, 50, yPosition);
      yPosition += 8;
      
      pdf.text('WAYBILL NO. :', 20, yPosition);
      pdf.text('_________________', 50, yPosition);
      yPosition += 15;

      // Right side details
      yPosition = 40; // Reset to align with left side
      const grnNumber = `GRN-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      pdf.text('GRN NO. :', 120, yPosition);
      pdf.text(grnNumber, 150, yPosition);
      yPosition += 8;
      
      pdf.text('DATE :', 120, yPosition);
      pdf.text(grnFormData.date, 150, yPosition);
      yPosition += 20;

      // Item Details Table Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('ITEM NO.', 20, yPosition);
      pdf.text('ITEM', 50, yPosition);
      pdf.text('QTY RECEIVED', 120, yPosition);
      pdf.text('REMARKS', 160, yPosition);
      yPosition += 10;

      // Draw line under header
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 8;

      // Products
      pdf.setFont('helvetica', 'normal');
      
      for (let i = 0; i < uploadedData.length; i++) {
        const row = uploadedData[i];
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        // Item number
        pdf.text(`${i + 1}.`, 20, yPosition);
        
        // Item name and SKU
        const productName = row.productName || 'Unknown Product';
        const productSku = row.sku || 'N/A';
        pdf.text(productName, 50, yPosition);
        pdf.setFontSize(8);
        pdf.text(`(SKU: ${productSku})`, 50, yPosition + 4);
        pdf.setFontSize(10);
        
        // Empty quantity brackets for manual inspection
        pdf.text('[ ]', 120, yPosition);
        
        // Empty remarks
        pdf.text('', 160, yPosition);
        
        yPosition += 12;
      }

      yPosition += 20;

      // Signatures Section
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Left side signatures
      pdf.text('RECEIVED BY :', 20, yPosition);
      pdf.text(grnFormData.receivedBy, 50, yPosition);
      yPosition += 8;
      
      pdf.text('SENT BY :', 20, yPosition);
      pdf.text('_________________', 50, yPosition);
      yPosition += 8;
      
      pdf.text('APPROVED BY :', 20, yPosition);
      pdf.text('_________________', 50, yPosition);
      yPosition += 20;

      // Right side signature lines
      yPosition = yPosition - 20; // Reset to align with left side
      pdf.text('SIGNATURE :', 120, yPosition);
      pdf.line(150, yPosition - 2, 190, yPosition - 2);
      yPosition += 8;
      
      pdf.text('SIGNATURE :', 120, yPosition);
      pdf.line(150, yPosition - 2, 190, yPosition - 2);
      yPosition += 8;
      
      pdf.text('SIGNATURE :', 120, yPosition);
      pdf.line(150, yPosition - 2, 190, yPosition - 2);
      yPosition += 15;

      // Remarks Section
      pdf.text('REMARKS :', 20, yPosition);
      yPosition += 8;
      
      // Draw lines for remarks
      for (let i = 0; i < 3; i++) {
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 6;
      }

      // Download the PDF
      const filename = `GRN_${grnNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      success(`GRN generated successfully: ${filename}`);
      setShowGrnGenerator(false);

    } catch (err: unknown) {
      console.error('Error generating GRN:', err);
      showError('Failed to generate GRN. Please try again.');
    }
  };

  const processBulkUpload = async () => {
    // Validate GRN is uploaded
    if (!grnFile) {
      showError('GRN Document is required');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      const validRows = uploadedData.filter(row => row.isValid);
      
      // Create FormData to send both movements and files
      const formData = new FormData();
      formData.append('movements', JSON.stringify({
        movements: validRows.map(row => ({
          productId: row.productId,
          stockItemId: '', // Will be determined by API
          type: row.type,
          quantity: row.quantity,
          warehouseId: row.warehouseId,
          reference: row.reference,
          reason: row.reason,
          notes: row.notes,
          unitCost: row.unitCost,
          totalCost: row.totalCost
        }))
      }));

      // Add GRN file if uploaded
      if (grnFile) {
        formData.append('grnFile', grnFile);
      }

      // Add PO file if uploaded
      if (poFile) {
        formData.append('poFile', poFile);
      }

      const response = await fetch('/api/stock-movements/bulk', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setProcessingResults({
          success: result.successCount,
          errors: result.errorCount,
          details: result.details
        });
        setStep('complete');
        success(`Successfully processed ${result.successCount} movements`);
      } else {
        throw new Error(result.error || 'Failed to process bulk upload');
      }
    } catch (error) {
      showError('Error processing bulk upload');
      console.error('Error:', error);
      setStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setUploadedData([]);
    setProcessingResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSuccess = () => {
    resetModal();
    onSuccess();
  };

  if (!isOpen) return null;

  const validRows = uploadedData.filter(row => row.isValid);
  const invalidRows = uploadedData.filter(row => !row.isValid);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Stock Movement Upload
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <FileSpreadsheet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Stock Movements
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload an Excel file with stock movement data. Download the template to get started.
                </p>
              </div>


              <div className="flex justify-center space-x-4">
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white border-0"
                  style={{ 
                    backgroundColor: theme.primary === 'purple-600' ? '#9333ea' : 
                                    theme.primary === 'blue-600' ? '#2563eb' :
                                    theme.primary === 'green-600' ? '#16a34a' :
                                    theme.primary === 'orange-600' ? '#ea580c' :
                                    theme.primary === 'red-600' ? '#dc2626' :
                                    theme.primary === 'indigo-600' ? '#4f46e5' :
                                    theme.primary === 'pink-600' ? '#db2777' :
                                    theme.primary === 'teal-600' ? '#0d9488' : '#2563eb',
                    '--hover-bg': theme.primary === 'purple-600' ? '#7c3aed' : 
                                 theme.primary === 'blue-600' ? '#1d4ed8' :
                                 theme.primary === 'green-600' ? '#15803d' :
                                 theme.primary === 'orange-600' ? '#c2410c' :
                                 theme.primary === 'red-600' ? '#b91c1c' :
                                 theme.primary === 'indigo-600' ? '#4338ca' :
                                 theme.primary === 'pink-600' ? '#be185d' :
                                 theme.primary === 'teal-600' ? '#0f766e' : '#1d4ed8'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    const hoverColor = theme.primary === 'purple-600' ? '#7c3aed' : 
                                     theme.primary === 'blue-600' ? '#1d4ed8' :
                                     theme.primary === 'green-600' ? '#15803d' :
                                     theme.primary === 'orange-600' ? '#c2410c' :
                                     theme.primary === 'red-600' ? '#b91c1c' :
                                     theme.primary === 'indigo-600' ? '#4338ca' :
                                     theme.primary === 'pink-600' ? '#be185d' :
                                     theme.primary === 'teal-600' ? '#0f766e' : '#1d4ed8';
                    e.currentTarget.style.backgroundColor = hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    const normalColor = theme.primary === 'purple-600' ? '#9333ea' : 
                                      theme.primary === 'blue-600' ? '#2563eb' :
                                      theme.primary === 'green-600' ? '#16a34a' :
                                      theme.primary === 'orange-600' ? '#ea580c' :
                                      theme.primary === 'red-600' ? '#dc2626' :
                                      theme.primary === 'indigo-600' ? '#4f46e5' :
                                      theme.primary === 'pink-600' ? '#db2777' :
                                      theme.primary === 'teal-600' ? '#0d9488' : '#2563eb';
                    e.currentTarget.style.backgroundColor = normalColor;
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Supported File Types:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Excel files (.xlsx, .xls)</li>
                  <li>• CSV files (.csv)</li>
                  <li>• Maximum 1000 rows per upload</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Upload Data
                </h3>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setStep('upload')}
                    className="text-white border-0"
                    style={{ 
                      backgroundColor: theme.primary === 'purple-600' ? '#9333ea' : 
                                      theme.primary === 'blue-600' ? '#2563eb' :
                                      theme.primary === 'green-600' ? '#16a34a' :
                                      theme.primary === 'orange-600' ? '#ea580c' :
                                      theme.primary === 'red-600' ? '#dc2626' :
                                      theme.primary === 'indigo-600' ? '#4f46e5' :
                                      theme.primary === 'pink-600' ? '#db2777' :
                                      theme.primary === 'teal-600' ? '#0d9488' : '#2563eb'
                    }}
                    onMouseEnter={(e) => {
                      const hoverColor = theme.primary === 'purple-600' ? '#7c3aed' : 
                                       theme.primary === 'blue-600' ? '#1d4ed8' :
                                       theme.primary === 'green-600' ? '#15803d' :
                                       theme.primary === 'orange-600' ? '#c2410c' :
                                       theme.primary === 'red-600' ? '#b91c1c' :
                                       theme.primary === 'indigo-600' ? '#4338ca' :
                                       theme.primary === 'pink-600' ? '#be185d' :
                                       theme.primary === 'teal-600' ? '#0f766e' : '#1d4ed8';
                      e.currentTarget.style.backgroundColor = hoverColor;
                    }}
                    onMouseLeave={(e) => {
                      const normalColor = theme.primary === 'purple-600' ? '#9333ea' : 
                                        theme.primary === 'blue-600' ? '#2563eb' :
                                        theme.primary === 'green-600' ? '#16a34a' :
                                        theme.primary === 'orange-600' ? '#ea580c' :
                                        theme.primary === 'red-600' ? '#dc2626' :
                                        theme.primary === 'indigo-600' ? '#4f46e5' :
                                        theme.primary === 'pink-600' ? '#db2777' :
                                        theme.primary === 'teal-600' ? '#0d9488' : '#2563eb';
                      e.currentTarget.style.backgroundColor = normalColor;
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={processBulkUpload}
                    disabled={validRows.length === 0 || !grnFile}
                    className="text-white border-0"
                    style={{ 
                      backgroundColor: theme.primary === 'purple-600' ? '#9333ea' : 
                                      theme.primary === 'blue-600' ? '#2563eb' :
                                      theme.primary === 'green-600' ? '#16a34a' :
                                      theme.primary === 'orange-600' ? '#ea580c' :
                                      theme.primary === 'red-600' ? '#dc2626' :
                                      theme.primary === 'indigo-600' ? '#4f46e5' :
                                      theme.primary === 'pink-600' ? '#db2777' :
                                      theme.primary === 'teal-600' ? '#0d9488' : '#2563eb'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        const hoverColor = theme.primary === 'purple-600' ? '#7c3aed' : 
                                         theme.primary === 'blue-600' ? '#1d4ed8' :
                                         theme.primary === 'green-600' ? '#15803d' :
                                         theme.primary === 'orange-600' ? '#c2410c' :
                                         theme.primary === 'red-600' ? '#b91c1c' :
                                         theme.primary === 'indigo-600' ? '#4338ca' :
                                         theme.primary === 'pink-600' ? '#be185d' :
                                         theme.primary === 'teal-600' ? '#0f766e' : '#1d4ed8';
                        e.currentTarget.style.backgroundColor = hoverColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        const normalColor = theme.primary === 'purple-600' ? '#9333ea' : 
                                          theme.primary === 'blue-600' ? '#2563eb' :
                                          theme.primary === 'green-600' ? '#16a34a' :
                                          theme.primary === 'orange-600' ? '#ea580c' :
                                          theme.primary === 'red-600' ? '#dc2626' :
                                          theme.primary === 'indigo-600' ? '#4f46e5' :
                                          theme.primary === 'pink-600' ? '#db2777' :
                                          theme.primary === 'teal-600' ? '#0d9488' : '#2563eb';
                        e.currentTarget.style.backgroundColor = normalColor;
                      }
                    }}
                  >
                    Process {validRows.length} Valid Rows
                  </Button>
                </div>
              </div>

              {/* GRN and PO Upload Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Upload Supporting Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GRN Document <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleGrnFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {grnFile && (
                      <p className="text-sm text-green-600 mt-1">✓ {grnFile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Order (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handlePoFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {poFile && (
                      <p className="text-sm text-green-600 mt-1">✓ {poFile.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valid Rows</p>
                      <p className="text-2xl font-bold text-green-600">{validRows.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Invalid Rows</p>
                      <p className="text-2xl font-bold text-red-600">{invalidRows.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Rows</p>
                      <p className="text-2xl font-bold text-blue-600">{uploadedData.length}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {invalidRows.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Invalid Rows ({invalidRows.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Row</th>
                            <th className="text-left py-2">SKU</th>
                            <th className="text-left py-2">Quantity</th>
                            <th className="text-left py-2">Type</th>
                            <th className="text-left py-2">Warehouse</th>
                            <th className="text-left py-2">Errors</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invalidRows.map((row, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{row.rowNumber}</td>
                              <td className="py-2">
                                <select
                                  value={row.sku}
                                  onChange={(e) => updateRowData(row.id, 'sku', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                >
                                  <option value="">Select SKU</option>
                                  {products.map(product => (
                                    <option key={product.id} value={product.sku}>
                                      {product.sku} - {product.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  value={row.quantity}
                                  onChange={(e) => updateRowData(row.id, 'quantity', Number(e.target.value))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                />
                              </td>
                              <td className="py-2">
                                <select
                                  value={row.type}
                                  onChange={(e) => updateRowData(row.id, 'type', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                >
                                  <option value="RECEIPT">RECEIPT</option>
                                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                                  <option value="TRANSFER_OUT">TRANSFER_OUT</option>
                                  <option value="TRANSFER_IN">TRANSFER_IN</option>
                                </select>
                              </td>
                              <td className="py-2">
                                <select
                                  value={row.warehouseCode}
                                  onChange={(e) => updateRowData(row.id, 'warehouseCode', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                >
                                  <option value="">Select Warehouse</option>
                                  {warehouses.map(warehouse => (
                                    <option key={warehouse.id} value={warehouse.code}>
                                      {warehouse.code} - {warehouse.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2">
                                <div className="text-red-600">
                                  {row.errors?.map((error, i) => (
                                    <div key={i} className="text-xs">{error}</div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {validRows.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Valid Rows ({validRows.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Row</th>
                            <th className="text-left py-2">SKU</th>
                            <th className="text-left py-2">Product</th>
                            <th className="text-left py-2">Quantity</th>
                            <th className="text-left py-2">Type</th>
                            <th className="text-left py-2">Warehouse</th>
                            <th className="text-left py-2">Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validRows.slice(0, 10).map((row, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{row.rowNumber}</td>
                              <td className="py-2">
                                <select
                                  value={row.sku}
                                  onChange={(e) => updateRowData(row.id, 'sku', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                >
                                  <option value="">Select SKU</option>
                                  {products.map(product => (
                                    <option key={product.id} value={product.sku}>
                                      {product.sku} - {product.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2">{row.productName}</td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  value={row.quantity}
                                  onChange={(e) => updateRowData(row.id, 'quantity', Number(e.target.value))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                />
                              </td>
                              <td className="py-2">
                                <select
                                  value={row.type}
                                  onChange={(e) => updateRowData(row.id, 'type', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                >
                                  <option value="RECEIPT">RECEIPT</option>
                                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                                  <option value="TRANSFER_OUT">TRANSFER_OUT</option>
                                  <option value="TRANSFER_IN">TRANSFER_IN</option>
                                </select>
                              </td>
                              <td className="py-2">
                                <select
                                  value={row.warehouseCode}
                                  onChange={(e) => updateRowData(row.id, 'warehouseCode', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                                >
                                  <option value="">Select Warehouse</option>
                                  {warehouses.map(warehouse => (
                                    <option key={warehouse.id} value={warehouse.code}>
                                      {warehouse.code} - {warehouse.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2">{row.reference}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {validRows.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Showing first 10 rows. {validRows.length - 10} more rows will be processed.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing Stock Movements
              </h3>
              <p className="text-gray-600">
                Please wait while we process your bulk upload...
              </p>
            </div>
          )}

          {step === 'complete' && processingResults && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Complete
                </h3>
                <p className="text-gray-600">
                  Your bulk stock movement upload has been processed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Successfully Processed</p>
                      <p className="text-2xl font-bold text-green-600">{processingResults.success}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Errors</p>
                      <p className="text-2xl font-bold text-red-600">{processingResults.errors}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button 
                  onClick={handleSuccess}
                  className="text-white border-0"
                  style={{ 
                    backgroundColor: theme.primary === 'purple-600' ? '#9333ea' : 
                                    theme.primary === 'blue-600' ? '#2563eb' :
                                    theme.primary === 'green-600' ? '#16a34a' :
                                    theme.primary === 'orange-600' ? '#ea580c' :
                                    theme.primary === 'red-600' ? '#dc2626' :
                                    theme.primary === 'indigo-600' ? '#4f46e5' :
                                    theme.primary === 'pink-600' ? '#db2777' :
                                    theme.primary === 'teal-600' ? '#0d9488' : '#2563eb'
                  }}
                  onMouseEnter={(e) => {
                    const hoverColor = theme.primary === 'purple-600' ? '#7c3aed' : 
                                     theme.primary === 'blue-600' ? '#1d4ed8' :
                                     theme.primary === 'green-600' ? '#15803d' :
                                     theme.primary === 'orange-600' ? '#c2410c' :
                                     theme.primary === 'red-600' ? '#b91c1c' :
                                     theme.primary === 'indigo-600' ? '#4338ca' :
                                     theme.primary === 'pink-600' ? '#be185d' :
                                     theme.primary === 'teal-600' ? '#0f766e' : '#1d4ed8';
                    e.currentTarget.style.backgroundColor = hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    const normalColor = theme.primary === 'purple-600' ? '#9333ea' : 
                                      theme.primary === 'blue-600' ? '#2563eb' :
                                      theme.primary === 'green-600' ? '#16a34a' :
                                      theme.primary === 'orange-600' ? '#ea580c' :
                                      theme.primary === 'red-600' ? '#dc2626' :
                                      theme.primary === 'indigo-600' ? '#4f46e5' :
                                      theme.primary === 'pink-600' ? '#db2777' :
                                      theme.primary === 'teal-600' ? '#0d9488' : '#2563eb';
                    e.currentTarget.style.backgroundColor = normalColor;
                  }}
                >
                  View Stock Movements
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
