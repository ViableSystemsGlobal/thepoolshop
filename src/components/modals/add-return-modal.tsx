'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, PackageX, Package, DollarSign, FileText, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { CustomerSearch } from '@/components/ui/customer-search';
import { formatCurrency } from '@/lib/utils';
import { ReturnReason } from '@prisma/client';

interface Product {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
}

interface ReturnLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  reason?: string;
}

interface AddReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddReturnModal({
  isOpen,
  onClose,
  onSuccess,
}: AddReturnModalProps) {
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [isLoadingSalesOrders, setIsLoadingSalesOrders] = useState(false);
  
  const [formData, setFormData] = useState({
    accountId: '',
    salesOrderId: '',
    reason: ReturnReason.CUSTOMER_REQUEST,
    notes: '',
  });

  const [returnLines, setReturnLines] = useState<ReturnLine[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      // Reset form
      setFormData({
        accountId: '',
        salesOrderId: '',
        reason: ReturnReason.CUSTOMER_REQUEST,
        notes: '',
      });
      setReturnLines([]);
      setSelectedCustomer(null);
      setSelectedSalesOrder(null);
      setSalesOrders([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.accountId) {
      loadSalesOrders(formData.accountId);
    } else {
      setSalesOrders([]);
      setSelectedSalesOrder(null);
    }
  }, [formData.accountId]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      console.log('🔍 Return Modal: Starting to load products...');
      
      // Fetch products - try without pagination first (like add-order-modal)
      const response = await fetch('/api/products', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Products API error:', response.status, errorText);
        throw new Error(`Failed to load products: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Products API response structure:', Object.keys(data));
      console.log('📦 Products array:', data.products);
      console.log('📦 Products count:', data.products?.length || 0);
      
      // Extract products from response
      const productsList = data.products || [];
      console.log('📦 Extracted products list length:', productsList.length);
      
      if (productsList.length === 0) {
        console.warn('⚠️ No products in response!');
        // Try with pagination as fallback
        console.log('🔄 Trying with pagination...');
        const paginatedResponse = await fetch('/api/products?page=1&limit=10000', {
          credentials: 'include',
        });
        if (paginatedResponse.ok) {
          const paginatedData = await paginatedResponse.json();
          console.log('📦 Paginated response:', paginatedData.products?.length || 0);
          if (paginatedData.products && paginatedData.products.length > 0) {
            productsList.push(...paginatedData.products);
          }
        }
      }
      
      // Transform to match Product interface
      const transformedProducts = productsList.map((p: any) => ({
        id: p.id || '',
        name: p.name || 'Unnamed Product',
        sku: p.sku || 'N/A',
        sellingPrice: Number(p.price) || Number(p.sellingPrice) || 0
      }));
      
      console.log(`✅ Transformed ${transformedProducts.length} products for return modal`);
      console.log('📦 First few products:', transformedProducts.slice(0, 3));
      
      setProducts(transformedProducts);
      
      if (transformedProducts.length === 0) {
        console.warn('⚠️ No products loaded after transformation!');
        error('No products found. Please check if products exist in the system.');
      } else {
        console.log(`✅ Successfully loaded ${transformedProducts.length} products`);
      }
    } catch (err) {
      console.error('❌ Error loading products:', err);
      error(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (id: string, customer: any) => {
    setFormData(prev => ({ ...prev, accountId: id, salesOrderId: '' }));
    setSelectedCustomer(customer);
    setSelectedSalesOrder(null);
  };

  const loadSalesOrders = async (accountId: string) => {
    setIsLoadingSalesOrders(true);
    try {
      // Fetch both sales orders and existing returns
      const [ordersResponse, returnsResponse] = await Promise.all([
        fetch(`/api/orders?accountId=${accountId}&limit=100`, {
          credentials: 'include',
        }),
        fetch(`/api/returns?accountId=${accountId}&limit=1000`, {
          credentials: 'include',
        })
      ]);

      if (!ordersResponse.ok) {
        throw new Error('Failed to load sales orders');
      }

      const ordersData = await ordersResponse.json();
      const returnsData = returnsResponse.ok ? await returnsResponse.json() : { returns: [] };

      if (ordersData.success) {
        // Filter to only show SalesOrders (those with type 'salesOrder')
        let salesOrdersList = ordersData.data.orders.filter((order: any) => order.type === 'salesOrder');
        
        // Get sales order IDs that already have returns
        const salesOrderIdsWithReturns = new Set(
          returnsData.returns.map((ret: any) => ret.salesOrderId)
        );

        // Filter out sales orders that already have returns
        salesOrdersList = salesOrdersList.filter((order: any) => 
          !salesOrderIdsWithReturns.has(order.id)
        );

        setSalesOrders(salesOrdersList);
      } else {
        setSalesOrders([]);
      }
    } catch (err) {
      console.error('Error loading sales orders:', err);
      error('Failed to load sales orders');
      setSalesOrders([]);
    } finally {
      setIsLoadingSalesOrders(false);
    }
  };

  const handleSalesOrderChange = (salesOrderId: string) => {
    const salesOrder = salesOrders.find(so => so.id === salesOrderId);
    setSelectedSalesOrder(salesOrder);
    setFormData(prev => ({ ...prev, salesOrderId }));
    
    console.log('📦 Selected sales order:', salesOrder);
    console.log('📦 Sales order items:', salesOrder?.items);
    
    // Auto-populate return lines from sales order
    if (salesOrder && salesOrder.items && salesOrder.items.length > 0) {
      const lines: ReturnLine[] = salesOrder.items.map((item: any) => {
        // Try to get productId from product.id or productId field
        const productId = item.product?.id || item.productId;
        console.log('📦 Mapping item:', item, 'productId:', productId);
        
        return {
          productId: productId || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          lineTotal: item.totalPrice || item.lineTotal || 0,
          reason: ''
        };
      });
      
      console.log('📦 Auto-populated return lines:', lines);
      setReturnLines(lines);
    } else {
      console.warn('⚠️ No items found in sales order or sales order not found');
    }
  };

  const addReturnLine = () => {
    setReturnLines(prev => [...prev, {
      productId: '',
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
      reason: ''
    }]);
  };

  const removeReturnLine = (index: number) => {
    setReturnLines(prev => prev.filter((_, i) => i !== index));
  };

  const updateReturnLine = (index: number, field: string, value: any) => {
    setReturnLines(prev => {
      const newLines = [...prev];
      const line = { ...newLines[index] };
      
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          line.productId = value;
          line.unitPrice = product.sellingPrice;
          line.lineTotal = line.quantity * line.unitPrice;
        }
      } else if (field === 'quantity') {
        line.quantity = Math.max(1, parseInt(value) || 1);
        line.lineTotal = line.quantity * line.unitPrice;
      } else if (field === 'unitPrice') {
        line.unitPrice = parseFloat(value) || 0;
        line.lineTotal = line.quantity * line.unitPrice;
      } else {
        (line as any)[field] = value;
      }
      
      newLines[index] = line;
      return newLines;
    });
  };

  const getSubtotal = () => {
    return returnLines.reduce((sum, line) => sum + line.lineTotal, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.15; // 15% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const getSelectedProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.accountId) {
        throw new Error('Please select a customer');
      }
      if (!formData.salesOrderId) {
        throw new Error('Please select a sales order');
      }
      if (returnLines.length === 0) {
        throw new Error('Please add at least one item to return');
      }
      if (returnLines.some(line => !line.productId)) {
        throw new Error('Please select a product for all items');
      }

      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accountId: formData.accountId,
          salesOrderId: formData.salesOrderId,
          reason: formData.reason,
          notes: formData.notes,
          lines: returnLines
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create return');
      }

      success('Return created successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error creating return:', err);
      error(err instanceof Error ? err.message : 'Failed to create return');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const availableReasons = Object.values(ReturnReason);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Return</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Return Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="accountId">Customer *</Label>
              <CustomerSearch
                value={formData.accountId}
                onChange={handleCustomerChange}
                placeholder="Search for a customer"
                label="Customer"
                required
              />
              {selectedCustomer && (
                <p className="text-sm text-gray-600 mt-1">Selected: {selectedCustomer.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salesOrderId">Sales Order *</Label>
              {isLoadingSalesOrders ? (
                <div className="flex items-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading sales orders...</span>
                </div>
              ) : (
                <select
                  id="salesOrderId"
                  value={formData.salesOrderId}
                  onChange={(e) => handleSalesOrderChange(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                  required
                  disabled={!formData.accountId}
                >
                  <option value="">Select a sales order</option>
                  {salesOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - {formatCurrency(order.totalAmount, 'GHS')} ({order.status})
                    </option>
                  ))}
                </select>
              )}
              {!formData.accountId && (
                <p className="text-xs text-gray-500 mt-1">Please select a customer first</p>
              )}
              {formData.accountId && salesOrders.length === 0 && !isLoadingSalesOrders && (
                <p className="text-xs text-yellow-600 mt-1">No sales orders found for this customer</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="reason">Return Reason *</Label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value as ReturnReason)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                required
              >
                {availableReasons.map(reason => (
                  <option key={reason} value={reason}>
                    {reason.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Additional notes about this return..."
                className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
              />
            </div>
          </div>

          {/* Return Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Return Items</h3>
              <Button
                type="button"
                onClick={addReturnLine}
                className={`bg-${theme.primary} text-white hover:opacity-90`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {returnLines.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No items added yet. Click "Add Item" to start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {returnLines.map((line, index) => {
                  const product = getSelectedProduct(line.productId);
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label>Product *</Label>
                          {isLoadingProducts ? (
                            <div className="flex items-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-sm text-gray-500">Loading...</span>
                            </div>
                          ) : (
                            <select
                              value={line.productId}
                              onChange={(e) => updateReturnLine(index, 'productId', e.target.value)}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                              required
                            >
                              <option value="">Select product</option>
                              {products.length === 0 ? (
                                <option value="" disabled>No products available ({products.length})</option>
                              ) : (
                                products.map(product => {
                                  console.log('📦 Rendering product option:', product);
                                  return (
                                    <option key={product.id} value={product.id}>
                                      {product.name || 'Unnamed'} ({product.sku || 'N/A'})
                                    </option>
                                  );
                                })
                              )}
                            </select>
                          )}
                        </div>

                        <div>
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updateReturnLine(index, 'quantity', e.target.value)}
                            className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                            required
                          />
                        </div>

                        <div>
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.unitPrice}
                            onChange={(e) => updateReturnLine(index, 'unitPrice', e.target.value)}
                            className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                            required
                          />
                        </div>

                        <div>
                          <Label>Total</Label>
                          <Input
                            type="text"
                            value={formatCurrency(line.lineTotal, 'GHS')}
                            readOnly
                            className="bg-gray-100"
                          />
                        </div>

                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReturnLine(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label>Item Notes (Optional)</Label>
                        <Input
                          value={line.reason || ''}
                          onChange={(e) => updateReturnLine(index, 'reason', e.target.value)}
                          placeholder="Specific reason for returning this item..."
                          className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Return Summary */}
          {returnLines.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-3">Return Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-700">Subtotal:</span>
                  <span className="font-medium text-red-900">{formatCurrency(subtotal, 'GHS')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-700">Tax (15%):</span>
                  <span className="font-medium text-red-900">{formatCurrency(tax, 'GHS')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-red-300">
                  <span className="text-red-700 font-medium">Total Refund:</span>
                  <span className="text-xl font-bold text-red-900">{formatCurrency(total, 'GHS')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || returnLines.length === 0}
              style={{ backgroundColor: getThemeColor() || '#2563eb' }}
              className="text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Return'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

