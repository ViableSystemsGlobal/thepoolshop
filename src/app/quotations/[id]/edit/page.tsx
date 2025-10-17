'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  Package,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Search,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface LineItem {
  id: string;
  productId?: string;
  productName: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxes: TaxItem[];
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface TaxItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

interface Quotation {
  id: string;
  number: string;
  status: string;
  subject: string;
  validUntil: string;
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  accountId?: string;
  distributorId?: string;
  customerType: string;
  createdAt: string;
  account?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  distributor?: {
    id: string;
    businessName: string;
    email: string;
    phone: string;
  };
  lines: LineItem[];
}

const DEFAULT_TAXES: TaxItem[] = [
  { id: '1', name: 'VAT', rate: 15, amount: 0 },
  { id: '2', name: 'Service Tax', rate: 5, amount: 0 }
];

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const { themeColor, customLogo, getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Product search
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerType, setCustomerType] = useState<'account' | 'distributor' | 'lead'>('account');
  const [lines, setLines] = useState<LineItem[]>([]);
  const [globalTaxes, setGlobalTaxes] = useState<TaxItem[]>(DEFAULT_TAXES);
  const [taxInclusive, setTaxInclusive] = useState(false);

  // Load quotation data
  useEffect(() => {
    if (params.id) {
      loadQuotation(params.id as string);
    }
    loadProducts();
  }, [params.id]);

  // Recalculate line totals when taxInclusive changes
  useEffect(() => {
    if (lines.length > 0) {
      setLines(lines.map(line => {
        const baseAmount = line.quantity * line.unitPrice * (1 - line.discount / 100);
        const totalTaxAmount = line.taxes.reduce((sum, tax) => sum + tax.amount, 0);
        return {
          ...line,
          lineTotal: taxInclusive ? baseAmount + totalTaxAmount : baseAmount
        };
      }));
    }
  }, [taxInclusive]);

  // Close product search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProductSearch) {
        const target = event.target as Element;
        if (!target.closest('.product-search-container')) {
          setShowProductSearch(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProductSearch]);

  const loadQuotation = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotations/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load quotation');
      }
      
      const data = await response.json();
      setQuotation(data);
      
      // Populate form
      setSubject(data.subject);
      setValidUntil(data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '');
      setNotes(data.notes || '');
      setTaxInclusive(data.taxInclusive || false);
      
      // Set customer
      if (data.account) {
        setCustomerId(data.account.id);
        setCustomerName(data.account.name);
        setCustomerType('account');
      } else if (data.distributor) {
        setCustomerId(data.distributor.id);
        setCustomerName(data.distributor.businessName);
        setCustomerType('distributor');
      } else if (data.lead) {
        // Handle lead customers
        setCustomerId(data.lead.id);
        setCustomerName(`${data.lead.firstName} ${data.lead.lastName}`.trim());
        setCustomerType('lead'); // Set as lead type
      }
      
      // Set lines with initialized taxes and product info
      const linesWithTaxes = (data.lines || []).map((line: any) => ({
        ...line,
        productId: line.product?.id || line.productId || '',
        productName: line.product?.name || line.productName || `Item ${data.lines.indexOf(line) + 1}`,
        description: line.description || '',
        sku: line.product?.sku || line.sku || '',
        taxes: line.taxes || [...DEFAULT_TAXES.map(tax => ({
          ...tax,
          amount: line.lineTotal * (tax.rate / 100)
        }))]
      }));
      setLines(linesWithTaxes);
      
    } catch (err) {
      console.error('Error loading quotation:', err);
      error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // The API returns an object with products property containing products array
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = lines.reduce((sum, line) => {
      return sum + (line.quantity * line.unitPrice * (1 - line.discount / 100));
    }, 0);
    
    const totalDiscount = lines.reduce((sum, line) => {
      return sum + (line.quantity * line.unitPrice * (line.discount / 100));
    }, 0);
    
    // Calculate taxes by type
    const taxesByType: { [key: string]: number } = {};
    let totalTax = 0;
    
    lines.forEach(line => {
      if (!line.taxes) {
        line.taxes = [...globalTaxes];
      }
      
      line.taxes.forEach(tax => {
        if (!taxesByType[tax.id]) {
          taxesByType[tax.id] = 0;
        }
        taxesByType[tax.id] += tax.amount;
        totalTax += tax.amount;
      });
    });
    
    const total = subtotal + totalTax;
    
    return { subtotal, totalDiscount, taxesByType, totalTax, total };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!subject.trim()) {
        error('Subject is required');
        return;
      }
      
      if (!customerId) {
        error('Customer selection is required');
        return;
      }
      
      const payload = {
        subject,
        validUntil: validUntil || null,
        notes,
        taxInclusive,
        accountId: customerType === 'account' ? customerId : undefined,
        distributorId: customerType === 'distributor' ? customerId : undefined,
        leadId: customerType === 'lead' ? customerId : undefined,
        customerType: quotation?.customerType || 'STANDARD',
        lines: lines.map(line => ({
          ...line,
          lineTotal: line.quantity * line.unitPrice * (1 - line.discount / 100)
        }))
      };
      
      const response = await fetch(`/api/quotations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          const text = await response.text();
          console.log('📥 Response text:', text);
          errorData = text ? JSON.parse(text) : { error: 'Unknown error' };
        } catch (e) {
          errorData = { error: 'Failed to parse error response' };
        }
        console.error('Failed to update quotation:', errorData);
        throw new Error(errorData.error || 'Failed to update quotation');
      }
      
      success('Quotation updated successfully');
      router.push('/quotations');
      
    } catch (err) {
      console.error('Error updating quotation:', err);
      error('Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  const addLineItem = (product?: Product) => {
    const newLine: LineItem = {
      id: `line-${Date.now()}`,
      productId: product?.id || '',
      productName: product?.name || '',
      description: '',
      sku: product?.sku || '',
      quantity: 1,
      unitPrice: product?.price || 0,
      discount: 0,
      taxes: [...globalTaxes],
      lineTotal: product?.price || 0
    };
    setLines([...lines, newLine]);
    setShowProductSearch(false);
    setProductSearchTerm("");
  };

  const updateLineItem = (lineId: string, updates: Partial<LineItem>) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, ...updates };
        // Calculate base amount after discount
        const baseAmount = updatedLine.quantity * updatedLine.unitPrice * (1 - updatedLine.discount / 100);
        
        // Recalculate tax amounts
        updatedLine.taxes = updatedLine.taxes.map(tax => ({
          ...tax,
          amount: baseAmount * (tax.rate / 100)
        }));
        
        // Line total should only include taxes if taxInclusive is true
        const totalTaxAmount = updatedLine.taxes.reduce((sum, tax) => sum + tax.amount, 0);
        updatedLine.lineTotal = taxInclusive ? baseAmount + totalTaxAmount : baseAmount;
        
        return updatedLine;
      }
      return line;
    }));
  };

  const removeLineItem = (lineId: string) => {
    setLines(lines.filter(line => line.id !== lineId));
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => {
    // Filter by search term
    const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearchTerm.toLowerCase());
    
    // Check if product is already added to lines
    const isAlreadyAdded = lines.some(line => line.productId === p.id);
    
    return matchesSearch && !isAlreadyAdded;
  }) : [];

  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading quotation...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!quotation) {
    return (
      <>
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quotation Not Found</h2>
            <p className="text-gray-600 mb-4">The quotation you're looking for doesn't exist.</p>
            <Link href="/quotations">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quotations
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/quotations">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Quotation</h1>
              <p className="text-gray-600">{quotation.number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/quotations')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* STRIPE-STYLE SPLIT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT PANEL - FORM */}
          <div className="space-y-6 max-h-screen overflow-y-auto scrollbar-hide lg:pr-2" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Customer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerName && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{customerName}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {customerType} • {quotation.customerType}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quotation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Quotation Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Quotation subject"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                      <span className="text-sm font-medium capitalize">{quotation.status.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tax Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Tax Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tax Inclusive Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="taxInclusive"
                    checked={taxInclusive}
                    onChange={(e) => setTaxInclusive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="taxInclusive" className="text-sm">
                    Tax Inclusive (hide tax breakdown)
                  </Label>
                </div>
                
                <div className="space-y-3">
                  {globalTaxes.map((tax) => (
                    <div key={tax.id} className="flex items-center space-x-3">
                      <Input
                        value={tax.name}
                        onChange={(e) => {
                          const updated = globalTaxes.map(t => 
                            t.id === tax.id ? { ...t, name: e.target.value } : t
                          );
                          setGlobalTaxes(updated);
                          // Update all line items with new tax name
                          setLines(lines.map(line => ({
                            ...line,
                            taxes: line.taxes.map(t => 
                              t.id === tax.id ? { ...t, name: e.target.value } : t
                            )
                          })));
                        }}
                        className="flex-1"
                        placeholder="Tax name"
                      />
                      <Input
                        type="number"
                        value={tax.rate}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 0;
                          const updated = globalTaxes.map(t => 
                            t.id === tax.id ? { ...t, rate } : t
                          );
                          setGlobalTaxes(updated);
                          // Update all line items with new tax rate
                          setLines(lines.map(line => ({
                            ...line,
                            taxes: line.taxes.map(t => 
                              t.id === tax.id ? { ...t, rate, amount: line.lineTotal * (rate / 100) } : t
                            )
                          })));
                        }}
                        className="w-20 text-sm"
                      />
                      <span className="text-sm text-gray-500">%</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (globalTaxes.length > 1) {
                            const updated = globalTaxes.filter(t => t.id !== tax.id);
                            setGlobalTaxes(updated);
                            setLines(lines.map(line => ({
                              ...line,
                              taxes: line.taxes.filter(t => t.id !== tax.id)
                            })));
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                        disabled={globalTaxes.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Products</span>
                  </CardTitle>
                  <div className="relative product-search-container">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowProductSearch(!showProductSearch)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    
                    {showProductSearch && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="p-3 border-b">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Search products..."
                              value={productSearchTerm}
                              onChange={(e) => setProductSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {isLoadingProducts ? (
                            <div className="p-4 text-center text-gray-500">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                              Loading products...
                            </div>
                          ) : filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              {productSearchTerm ? (
                                <>
                                  <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                  <div>No available products found</div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {lines.length > 0 ? "All matching products have been added" : "Try a different search term"}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                  <div>Search for products to add</div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {filteredProducts.map(product => (
                                <button
                                  key={product.id}
                                  onClick={() => addLineItem(product)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-sm text-gray-900">{product.name}</div>
                                      <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      GH₵{product.price.toFixed(2)}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Line Items */}
                {lines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    No items added yet. Click "Add Product" above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lines.map((line, index) => (
                      <div key={line.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{line.productName || `Item ${index + 1}`}</div>
                            {line.sku && <div className="text-xs text-gray-500">SKU: {line.sku}</div>}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeLineItem(line.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label>Product Name</Label>
                            <Input
                              value={line.productName}
                              onChange={(e) => updateLineItem(line.id, { productName: e.target.value })}
                              placeholder="Product name"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={line.description}
                              onChange={(e) => updateLineItem(line.id, { description: e.target.value })}
                              placeholder="Description"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={line.quantity}
                              onChange={(e) => updateLineItem(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              value={line.unitPrice}
                              onChange={(e) => updateLineItem(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label>Discount (%)</Label>
                            <Input
                              type="number"
                              value={line.discount}
                              onChange={(e) => updateLineItem(line.id, { discount: parseFloat(e.target.value) || 0 })}
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label>Total</Label>
                            <div className="flex items-center h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                              <span className="text-sm font-medium">
                                GH₵{(() => {
                                  const baseAmount = line.quantity * line.unitPrice * (1 - line.discount / 100);
                                  if (taxInclusive) {
                                    const totalTaxAmount = line.taxes.reduce((sum, tax) => sum + tax.amount, 0);
                                    return (baseAmount + totalTaxAmount).toFixed(2);
                                  } else {
                                    return baseAmount.toFixed(2);
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL - LIVE PREVIEW */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Quotation Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Company Header */}
                <div className="text-center mb-8">
                  {customLogo ? (
                    <img 
                      src={customLogo} 
                      alt="Company Logo" 
                      className="h-16 w-auto mx-auto mb-4"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">{subject || 'Untitled Quotation'}</h2>
                  <p className="text-sm text-gray-600">{quotation.number}</p>
                </div>

                {/* Document Info */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">QUOTATION</div>
                    <div className="font-semibold">{quotation.number}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Valid Until</div>
                      <div>{validUntil ? new Date(validUntil).toLocaleDateString() : 'No expiry'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date</div>
                    <div className="font-semibold">{new Date(quotation.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {quotation.status.toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bill To</div>
                    <div className="font-semibold">{customerName || 'No customer'}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>{quotation.account?.email || quotation.distributor?.email || ''}</div>
                      <div>{quotation.account?.phone || quotation.distributor?.phone || ''}</div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-gray-700 uppercase">
                      <div className="col-span-1">#</div>
                      <div className="col-span-4">Description</div>
                      <div className="col-span-1">Qty</div>
                      <div className="col-span-2">Unit Price</div>
                      {lines.some(line => line.discount > 0) && (
                        <div className="col-span-2">Discount</div>
                      )}
                      <div className="col-span-2">Amount</div>
                    </div>
                    
                    {/* Table Body */}
                    <div className="max-h-48 overflow-y-auto">
                      {lines.map((line, index) => (
                        <div key={line.id} className={`grid grid-cols-12 gap-2 px-3 py-2 text-xs border-b border-gray-100 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <div className="col-span-1 text-gray-600">{index + 1}</div>
                          <div className="col-span-4">
                            <div className="font-medium text-gray-900">{line.productName || `Item ${index + 1}`}</div>
                            {line.sku && (
                              <div className="text-xs text-gray-500">SKU: {line.sku}</div>
                            )}
                            {line.description && (
                              <div className="text-xs text-gray-600">{line.description}</div>
                            )}
                          </div>
                          <div className="col-span-1 text-gray-600">{line.quantity}</div>
                          <div className="col-span-2 text-gray-600">GH₵{line.unitPrice.toFixed(2)}</div>
                          {lines.some(l => l.discount > 0) && (
                            <div className="col-span-2">
                              {line.discount > 0 ? (
                                <span className="text-green-600 font-medium">{line.discount}%</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          )}
                          <div className="col-span-2 font-medium text-gray-900">
                            GH₵{(() => {
                              const baseAmount = line.quantity * line.unitPrice * (1 - line.discount / 100);
                              if (taxInclusive) {
                                const totalTaxAmount = line.taxes.reduce((sum, tax) => sum + tax.amount, 0);
                                return (baseAmount + totalTaxAmount).toFixed(2);
                              } else {
                                return baseAmount.toFixed(2);
                              }
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 text-sm">
                  {!taxInclusive && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">GH₵{totals.subtotal.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">-GH₵{totals.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Individual Taxes - Only show when not tax inclusive */}
                  {!taxInclusive && Object.entries(totals.taxesByType).map(([taxId, amount]) => {
                    const tax = globalTaxes.find(t => t.id === taxId);
                    return (
                      <div key={taxId} className="flex justify-between items-center py-1">
                        <span className="text-gray-600">{tax?.name || 'Tax'} ({tax?.rate}%):</span>
                        <span className="font-medium">GH₵{amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-between items-center py-1 text-base font-bold border-t">
                    <span>{taxInclusive ? 'Total (Tax Inclusive):' : 'Total:'}</span>
                    <span className={`text-${theme.primary}`}>GH₵{totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500 mt-8">
                  Thank you for your business!
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}