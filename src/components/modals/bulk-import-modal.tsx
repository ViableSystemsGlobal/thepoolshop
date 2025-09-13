"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const { success, error: showError, warning } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setImportResult(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock import result
      const mockResult: ImportResult = {
        success: 15,
        errors: [
          "Row 3: SKU 'PROD-001' already exists",
          "Row 7: Invalid category 'Electronics'"
        ],
        warnings: [
          "Row 5: Price missing, using default $0.00",
          "Row 12: Description too long, truncated"
        ]
      };

      setImportResult(mockResult);
      
      // Show appropriate toast based on results
      if (mockResult.success > 0) {
        success("Import Completed", `${mockResult.success} products imported successfully.`);
      }
      if (mockResult.errors.length > 0) {
        showError("Import Errors", `${mockResult.errors.length} errors occurred during import.`);
      }
      if (mockResult.warnings.length > 0) {
        warning("Import Warnings", `${mockResult.warnings.length} warnings during import.`);
      }
    } catch (error) {
      const errorMessage = 'Failed to process file. Please try again.';
      setError(errorMessage);
      showError("Import Failed", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = [
      'SKU,Name,Description,Category,Price,Cost,Import Currency,UOM Base,UOM Sell,Active',
      'PROD-001,Premium Headphones,High-quality wireless headphones,Electronics,299.99,200.00,USD,pcs,pcs,true',
      'PROD-002,Office Chair,Ergonomic office chair,Furniture,199.99,120.00,USD,pcs,pcs,true',
      'PROD-003,Fitness Tracker,Smart fitness tracker,Electronics,149.99,80.00,USD,pcs,pcs,true'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5" />
              <span>Bulk Import Products</span>
            </CardTitle>
            <CardDescription>
              Import multiple products from a CSV or Excel file
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Template Download */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Step 1: Download Template</h3>
            <p className="text-sm text-gray-600">
              Download our CSV template to ensure your file has the correct format.
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Step 2: Upload Your File</h3>
            <p className="text-sm text-gray-600">
              Upload your CSV or Excel file with product data.
            </p>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  )}
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV, XLS, XLSX (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Import Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-800">
                      {importResult.success} Products
                    </div>
                    <div className="text-xs text-green-600">Successfully imported</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm font-medium text-red-800">
                        {importResult.errors.length} Errors
                      </div>
                      <div className="text-xs text-red-600">Need attention</div>
                    </div>
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div>
                      <div className="text-sm font-medium text-amber-800">
                        {importResult.warnings.length} Warnings
                      </div>
                      <div className="text-xs text-amber-600">Minor issues</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-800">Errors:</h4>
                  <div className="space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Details */}
              {importResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-800">Warnings:</h4>
                  <div className="space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Required Fields</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <div className="font-medium">Required:</div>
                <div>• SKU (unique)</div>
                <div>• Name</div>
                <div>• Category</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Optional:</div>
                <div>• Description</div>
                <div>• Price & Cost</div>
                <div>• UOM Base & Sell</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {importResult && importResult.success > 0 && (
              <Button 
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className={`bg-${theme.primary} hover:bg-${theme.primaryDark}`}
              >
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BulkImportModal;
