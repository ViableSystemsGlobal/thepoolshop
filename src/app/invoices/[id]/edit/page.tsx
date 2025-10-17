"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSearch } from "@/components/ui/customer-search";
import { 
  Save, 
  ArrowLeft,
  Plus, 
  Minus, 
  X, 
  Calendar,
  FileText,
  DollarSign,
  Percent,
  Calculator
} from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'account' | 'distributor' | 'lead';
  customerType?: 'STANDARD' | 'CREDIT';
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

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxes: TaxItem[];
  lineTotal: number;
}

const DEFAULT_TAXES: TaxItem[] = [
  { id: 'vat', name: 'VAT', rate: 15, amount: 0 },
  { id: 'nhil', name: 'NHIL', rate: 2.5, amount: 0 },
  { id: 'getfund', name: 'GETFund', rate: 2.5, amount: 0 },
  { id: 'covid', name: 'COVID-19', rate: 1, amount: 0 },
];

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  // Form state
  const [subject, setSubject] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerType, setCustomerType] = useState<'account' | 'distributor' | 'lead'>('account');
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [status, setStatus] = useState('DRAFT');

  // Line items
  const [lines, setLines] = useState<LineItem[]>([]);
  const [globalTaxes, setGlobalTaxes] = useState<TaxItem[]>(DEFAULT_TAXES);

  // Product search
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
      loadProducts();
    }
  }, [params.id]);

  // Set default due date (30 days from now)
  useEffect(() => {
    if (!dueDate) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
    }
  }, [dueDate]);

  // Filter products based on search term
  useEffect(() => {
    if (productSearchTerm.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      // Filter out products that are already added
      const addedProductIds = lines.map(line => line.productId);
      setFilteredProducts(filtered.filter(product => !addedProductIds.includes(product.id)));
    } else {
      setFilteredProducts([]);
    }
  }, [productSearchTerm, products, lines]);

  const loadInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const invoice = data.invoice;
        
        setSubject(invoice.subject);
        setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '');
        setPaymentTerms(invoice.paymentTerms || '');
        setNotes(invoice.notes || '');
        setTaxInclusive(invoice.taxInclusive || false);
        setStatus(invoice.status);
        
        // Set customer
        if (invoice.account) {
          setCustomerId(invoice.account.id);
          setSelectedCustomer({
            id: invoice.account.id,
            name: invoice.account.name,
            email: invoice.account.email,
            phone: invoice.account.phone,
            type: 'account',
            customerType: 'STANDARD'
          });
          setCustomerType('account');
        } else if (invoice.distributor) {
          setCustomerId(invoice.distributor.id);
          setSelectedCustomer({
            id: invoice.distributor.id,
            name: invoice.distributor.businessName,
            email: invoice.distributor.email,
            phone: invoice.distributor.phone,
            type: 'distributor',
            customerType: 'STANDARD'
          });
          setCustomerType('distributor');
        } else if (invoice.lead) {
          setCustomerId(invoice.lead.id);
          setSelectedCustomer({
            id: invoice.lead.id,
            name: `${invoice.lead.firstName} ${invoice.lead.lastName}`,
            email: invoice.lead.email,
            phone: invoice.lead.phone,
            type: 'lead',
            customerType: 'STANDARD'
          });
          setCustomerType('lead');
        }
        
        // Set line items
        if (invoice.lines && invoice.lines.length > 0) {
          const mappedLines = invoice.lines.map((line: any) => ({
            id: line.id,
            productId: line.productId,
            productName: line.productName || line.product?.name || 'Unknown Product',
            sku: line.sku || line.product?.sku || '',
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            taxes: line.taxes ? JSON.parse(line.taxes) : [],
            lineTotal: line.lineTotal,
          }));
          setLines(mappedLines);
        }
      } else {
        showError("Failed to load invoice");
        router.push('/invoices');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      showError("Failed to load invoice");
      router.push('/invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addLineItem = (product: Product) => {
    const baseAmount = product.price || 0;
    
    // Calculate taxes immediately
    const taxes = globalTaxes.map(tax => {
      const taxAmount = baseAmount * (tax.rate / 100);
      return { ...tax, amount: taxAmount };
    });
    
    const totalTaxAmount = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    
    const newLine: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      unitPrice: product.price || 0,
      discount: 0,
      taxes: taxes,
      lineTotal: taxInclusive ? baseAmount + totalTaxAmount : baseAmount,
    };
    setLines([...lines, newLine]);
    setShowProductSearch(false);
    setProductSearchTerm("");
  };

  const removeLineItem = (lineId: string) => {
    setLines(lines.filter(line => line.id !== lineId));
  };

  const updateLineItem = (lineId: string, updates: Partial<LineItem>) => {
    setLines(lines.map(line => {
      if (line.id === lineId) {
        const updated = { ...line, ...updates };
        // Recalculate line total
        const subtotal = updated.quantity * updated.unitPrice;
        const discountAmount = subtotal * (updated.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        
        // Recalculate taxes
        updated.taxes = updated.taxes.map(tax => ({
          ...tax,
          amount: afterDiscount * (tax.rate / 100)
        }));
        
        const totalTaxAmount = updated.taxes.reduce((sum, tax) => sum + tax.amount, 0);
        updated.lineTotal = taxInclusive ? afterDiscount + totalTaxAmount : afterDiscount;
        
        return updated;
      }
      return line;
    }));
  };

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

  // Calculate totals
  const totals = lines.reduce((acc, line) => {
    const subtotal = line.quantity * line.unitPrice;
    const discountAmount = subtotal * (line.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    
    acc.subtotal += afterDiscount;
    acc.totalDiscount += discountAmount;
    
    line.taxes.forEach(tax => {
      if (!acc.taxesByType[tax.id]) {
        acc.taxesByType[tax.id] = 0;
      }
      acc.taxesByType[tax.id] += tax.amount;
    });
    
    acc.total += line.lineTotal;
    return acc;
  }, {
    subtotal: 0,
    totalDiscount: 0,
    taxesByType: {} as Record<string, number>,
    total: 0
  });

  const handleSubmit = async () => {
    if (!subject.trim()) {
      showError("Please enter a subject");
      return;
    }

    if (!selectedCustomer) {
      showError("Please select a customer");
      return;
    }

    if (lines.length === 0) {
      showError("Please add at least one item");
      return;
    }

    if (!dueDate) {
      showError("Please select a due date");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          accountId: selectedCustomer?.type === 'account' ? customerId : null,
          distributorId: selectedCustomer?.type === 'distributor' ? customerId : null,
          leadId: selectedCustomer?.type === 'lead' ? customerId : null,
          customerType: selectedCustomer?.customerType || 'STANDARD',
          dueDate,
          paymentTerms,
          notes,
          taxInclusive,
          status,
          lines: lines.map(line => ({
            productId: line.productId,
            productName: line.productName,
            sku: line.sku,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            taxes: line.taxes.map(tax => ({
              name: tax.name,
              rate: tax.rate,
              amount: tax.amount,
            })),
          })),
        }),
      });

      if (response.ok) {
        success("Invoice updated successfully!");
        router.push(`/invoices/${params.id}`);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      showError('Failed to update invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading invoice...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Left Panel - Form */}
        <div className="w-1/2 p-6 overflow-y-auto scrollbar-hide">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/invoices/${params.id}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
                  <p className="text-gray-600">Update invoice details</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Invoice subject"
                  />
                </div>

                <div>
                  <CustomerSearch
                    value={customerId}
                    onChange={(id, customer) => {
                      setCustomerId(id);
                      setSelectedCustomer(customer);
                    }}
                    placeholder="Search customers, distributors, or leads..."
                    label="Customer"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="e.g., Net 30, Net 60"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="VOID">Void</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes for the invoice"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="taxInclusive"
                    checked={taxInclusive}
                    onChange={(e) => setTaxInclusive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="taxInclusive">Tax Inclusive</Label>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Product */}
                <div className="mb-4">
                  {!showProductSearch ? (
                    <Button
                      onClick={() => setShowProductSearch(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Search products..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                        />
                        <Button
                          onClick={() => {
                            setShowProductSearch(false);
                            setProductSearchTerm("");
                          }}
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {productSearchTerm && (
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                              <div
                                key={product.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => addLineItem(product)}
                              >
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">
                                  SKU: {product.sku} • GH₵{product.price?.toFixed(2) || '0.00'}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-gray-500 text-center">
                              No products found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Line Items List */}
                {lines.length > 0 && (
                  <div className="space-y-3">
                    {lines.map((line, index) => (
                      <div key={line.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{line.productName}</div>
                            <div className="text-sm text-gray-500">SKU: {line.sku}</div>
                          </div>
                          <Button
                            onClick={() => removeLineItem(line.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => updateLineItem(line.id, { quantity: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) => updateLineItem(line.id, { unitPrice: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Discount %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={line.discount}
                              onChange={(e) => updateLineItem(line.id, { discount: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Line Total</Label>
                            <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                              <span className="text-sm font-medium">
                                GH₵{line.lineTotal.toFixed(2)}
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
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Invoice Preview</h2>
            
            {/* Company Header */}
            <div className="text-center mb-8 border-b pb-6">
              <div className="text-xl font-bold text-gray-900 mb-2">
                {subject || 'Untitled Invoice'}
              </div>
              <div className="text-sm text-gray-500">INV-XXXXXX</div>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Invoice
                </div>
                <div className="text-sm font-semibold text-gray-900">INV-XXXXXX</div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>Due Date</div>
                  <div>{dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Date
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {new Date().toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>Status</div>
                  <div className="capitalize">{status.toLowerCase()}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Bill To
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {selectedCustomer?.name || 'No customer selected'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>{selectedCustomer?.email || ''}</div>
                  <div>{selectedCustomer?.phone || ''}</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="text-sm font-semibold text-gray-900 mb-3">Items</div>
              {lines.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 grid grid-cols-6 text-xs font-semibold text-gray-600 uppercase tracking-wide p-3">
                    <div>#</div>
                    <div className="col-span-2">Description</div>
                    <div>Qty</div>
                    <div>Unit Price</div>
                    <div>Amount</div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {lines.map((line, index) => (
                      <div key={line.id} className="grid grid-cols-6 p-3 text-sm">
                        <div className="text-gray-500">{index + 1}</div>
                        <div className="col-span-2">
                          <div className="font-medium">{line.productName}</div>
                          <div className="text-xs text-gray-500">SKU: {line.sku}</div>
                        </div>
                        <div>{line.quantity}</div>
                        <div>GH₵{line.unitPrice.toFixed(2)}</div>
                        <div className="font-medium">GH₵{line.lineTotal.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">
                  No items added
                </div>
              )}
            </div>

            {/* Totals */}
            {lines.length > 0 && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
