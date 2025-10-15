'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, ShoppingCart, Package, DollarSign, Calendar, MapPin, FileText, Building, User, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { formatCurrency } from '@/lib/utils';
import { CustomerSearch } from '@/components/ui/customer-search';

interface Product {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stockQuantity: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: AddOrderModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerType: '',
    paymentMethod: 'cash',
    notes: '',
    deliveryAddress: '',
    deliveryDate: '',
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      // Reset form
      setFormData({
        customerId: '',
        customerType: '',
        paymentMethod: 'cash',
        notes: '',
        deliveryAddress: '',
        deliveryDate: '',
      });
      setOrderItems([]);
      setSelectedCustomer(null);
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('/api/products', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
      error('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (id: string, customer: any) => {
    setFormData(prev => ({ 
      ...prev, 
      customerId: id,
      customerType: customer.type
    }));
    setSelectedCustomer(customer);
  };

  const addOrderItem = () => {
    setOrderItems(prev => [...prev, {
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      notes: ''
    }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setOrderItems(prev => {
      const newItems = [...prev];
      const item = { ...newItems[index] };
      
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          item.productId = value;
          item.unitPrice = product.sellingPrice;
          item.totalPrice = item.quantity * item.unitPrice;
        }
      } else if (field === 'quantity') {
        item.quantity = Math.max(1, parseInt(value) || 1);
        item.totalPrice = item.quantity * item.unitPrice;
      } else if (field === 'unitPrice') {
        item.unitPrice = parseFloat(value) || 0;
        item.totalPrice = item.quantity * item.unitPrice;
      } else {
        (item as any)[field] = value;
      }
      
      newItems[index] = item;
      return newItems;
    });
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getSelectedProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.customerId) {
        throw new Error('Please select a customer');
      }
      if (orderItems.length === 0) {
        throw new Error('Please add at least one item to the order');
      }
      if (orderItems.some(item => !item.productId)) {
        throw new Error('Please select a product for all items');
      }

      const totalAmount = getTotalAmount();
      if (totalAmount <= 0) {
        throw new Error('Order total must be greater than 0');
      }

      // Prepare data based on customer type
      const orderData: any = {
        customerType: formData.customerType,
        customerId: formData.customerId,
        items: orderItems,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        deliveryAddress: formData.deliveryAddress,
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null
      };

      // For backward compatibility, also send distributorId if customer is a distributor
      if (formData.customerType === 'distributor') {
        orderData.distributorId = formData.customerId;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      success('Order created successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error creating order:', err);
      error(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = getTotalAmount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Order</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="customerId">Customer *</Label>
              <CustomerSearch
                value={formData.customerId}
                onChange={handleCustomerChange}
                placeholder="Search for a customer (Account, Contact, or Distributor)"
                label="Customer"
                required
              />
              {selectedCustomer && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-500">Type: {selectedCustomer.type}</p>
                  {selectedCustomer.email && (
                    <p className="text-xs text-gray-500">Email: {selectedCustomer.email}</p>
                  )}
                  {selectedCustomer.phone && (
                    <p className="text-xs text-gray-500">Phone: {selectedCustomer.phone}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                required
              >
                <option value="credit">Credit</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                rows={3}
                placeholder="Enter delivery address..."
                className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
              />
            </div>

            <div>
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="datetime-local"
                value={formData.deliveryDate}
                onChange={(e) => handleChange('deliveryDate', e.target.value)}
                className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Any additional notes for this order..."
              className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
            />
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Order Items</h3>
              <Button
                type="button"
                onClick={addOrderItem}
                className={`bg-${theme.primary} text-white hover:opacity-90`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No items added yet. Click "Add Item" to start building your order.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const product = getSelectedProduct(item.productId);
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
                              value={item.productId}
                              onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
                              required
                            >
                              <option value="">Select product</option>
                              {products.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.sku}) - {formatCurrency(product.sellingPrice)}
                                </option>
                              ))}
                            </select>
                          )}
                          {product && (
                            <p className="text-xs text-gray-500 mt-1">
                              Stock: {product.stockQuantity} units
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
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
                            value={item.unitPrice}
                            onChange={(e) => updateOrderItem(index, 'unitPrice', e.target.value)}
                            className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                            required
                          />
                        </div>

                        <div>
                          <Label>Total</Label>
                          <Input
                            type="text"
                            value={formatCurrency(item.totalPrice)}
                            readOnly
                            className="bg-gray-100"
                          />
                        </div>

                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label>Item Notes (Optional)</Label>
                        <Input
                          value={item.notes || ''}
                          onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                          placeholder="Special instructions for this item..."
                          className={`focus:ring-${theme.primary} focus:border-${theme.primary}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Total Amount:</span>
                <span className="text-xl font-bold text-blue-900">{formatCurrency(totalAmount)}</span>
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
            <button
              type="submit"
              disabled={loading || orderItems.length === 0}
              className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
