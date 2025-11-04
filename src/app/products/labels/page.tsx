'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarcodeDisplay } from '@/components/barcode-display';
import { Printer, Download, CheckSquare, Square, ArrowLeft } from 'lucide-react';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  name: string;
  barcode: string | null;
  barcodeType: string | null;
  price?: number;
  category?: { name: string };
}

export default function ProductLabelsPage() {
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'withBarcode' | 'withoutBarcode'>('withBarcode');
  const { success, error: showError } = useToast();

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
  
  useEffect(() => {
    fetchProducts();
  }, [filter]);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'withoutBarcode') {
        params.append('withoutBarcodes', 'true');
      }
      
      const response = await fetch(`/api/products/labels/bulk?${params}`);
      if (response.ok) {
        const data = await response.json();
        const filteredProducts = filter === 'withBarcode'
          ? data.products.filter((p: Product) => p.barcode)
          : filter === 'withoutBarcode'
          ? data.products.filter((p: Product) => !p.barcode)
          : data.products;
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };
  
  const selectAll = () => {
    setSelectedProducts(new Set(products.map(p => p.id)));
  };
  
  const deselectAll = () => {
    setSelectedProducts(new Set());
  };
  
  const printSelected = () => {
    if (selectedProducts.size === 0) {
      showError('Please select at least one product');
      return;
    }
    
    // Open print window with selected products
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    const selectedProductData = products.filter(p => selectedProducts.has(p.id) && p.barcode);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Product Labels</title>
          <style>
            @page {
              size: letter;
              margin: 0.5in;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .label-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            .label {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
              page-break-inside: avoid;
            }
            .product-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 4px;
              height: 32px;
              overflow: hidden;
            }
            .product-sku {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            .barcode-container {
              margin: 8px 0;
            }
            @media print {
              .label-grid {
                gap: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-grid">
            ${selectedProductData.map(product => `
              <div class="label">
                <div class="product-name">${product.name}</div>
                <div class="product-sku">SKU: ${product.sku}</div>
                <div class="barcode-container">
                  <svg id="barcode-${product.id}"></svg>
                </div>
              </div>
            `).join('')}
          </div>
          
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            ${selectedProductData.map(product => `
              JsBarcode("#barcode-${product.id}", "${product.barcode}", {
                format: "${product.barcodeType || 'EAN13'}",
                width: 1.5,
                height: 50,
                displayValue: true,
                fontSize: 12,
                margin: 5
              });
            `).join('\n')}
            
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    success(`Printing ${selectedProducts.size} labels`);
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Product Barcode Labels</h1>
              <p className="text-gray-600">Print barcode labels for your products</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={selectedProducts.size > 0 ? deselectAll : selectAll}
            >
              {selectedProducts.size > 0 ? 'Deselect All' : 'Select All'}
            </Button>
            
            <Button
              onClick={printSelected}
              disabled={selectedProducts.size === 0}
              className="gap-2 text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: getThemeColor() }}
            >
              <Printer className="h-4 w-4" />
              Print {selectedProducts.size > 0 ? `(${selectedProducts.size})` : 'Selected'}
            </Button>
          </div>
        </div>
        
        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filter === 'withBarcode'}
                  onChange={() => setFilter('withBarcode')}
                  className="cursor-pointer"
                />
                <span>Products with barcodes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filter === 'withoutBarcode'}
                  onChange={() => setFilter('withoutBarcode')}
                  className="cursor-pointer"
                />
                <span>Products without barcodes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={filter === 'all'}
                  onChange={() => setFilter('all')}
                  className="cursor-pointer"
                />
                <span>All products</span>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all ${
                  selectedProducts.has(product.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm">{product.name}</CardTitle>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      {product.category && (
                        <p className="text-xs text-gray-400">{product.category.name}</p>
                      )}
                    </div>
                    <div>
                      {selectedProducts.has(product.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {product.barcode && (
                  <CardContent>
                    <BarcodeDisplay
                      value={product.barcode}
                      format={(product.barcodeType as any) || 'EAN13'}
                      height={50}
                      width={1.5}
                      fontSize={12}
                      showActions={false}
                    />
                  </CardContent>
                )}
                
                {!product.barcode && (
                  <CardContent>
                    <div className="text-center py-4 text-gray-400">
                      No barcode assigned
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && products.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              {filter === 'withoutBarcode' 
                ? 'All products have barcodes! 🎉'
                : 'No products found'}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

