'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  Package,
  Edit,
  Download,
  Mail,
  DollarSign,
  Clock
} from 'lucide-react';

interface LineItem {
  id: string;
  productId?: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxes: any[];
  lineTotal: number;
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
  updatedAt: string;
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
  owner: {
    id: string;
    name: string;
    email: string;
  };
  lines: LineItem[];
}

export default function ViewQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const { theme, customLogo } = useTheme();
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadQuotation(params.id as string);
    }
  }, [params.id]);

  const loadQuotation = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotations/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load quotation');
      }
      
      const data = await response.json();
      setQuotation(data);
      
    } catch (err) {
      console.error('Error loading quotation:', err);
      router.push('/quotations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.toLowerCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quotation...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quotation) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quotation Not Found</h2>
            <p className="text-gray-600 mb-4">The quotation you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/quotations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotations
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const customer = quotation.account || quotation.distributor;

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/quotations')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotations
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quotation Details</h1>
              <p className="text-gray-600">{quotation.number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/quotations/${quotation.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Quotation Preview
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
                  <h2 className="text-2xl font-bold text-gray-900">{quotation.subject}</h2>
                  <p className="text-sm text-gray-600">{quotation.number}</p>
                </div>

                {/* Document Info */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">QUOTATION</div>
                    <div className="font-semibold">{quotation.number}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Valid Until</div>
                      <div>{quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'No expiry'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date</div>
                    <div className="font-semibold">{new Date(quotation.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
                      <div>{getStatusBadge(quotation.status)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bill To</div>
                    <div className="font-semibold">{customer?.name || customer?.businessName || 'No customer'}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>{customer?.email || ''}</div>
                      <div>{customer?.phone || ''}</div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-900">Description</th>
                        <th className="text-center py-2 font-medium text-gray-900">Qty</th>
                        <th className="text-right py-2 font-medium text-gray-900">Unit Price</th>
                        <th className="text-right py-2 font-medium text-gray-900">Discount</th>
                        <th className="text-right py-2 font-medium text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.lines.map((line, index) => (
                        <tr key={line.id} className="border-b">
                          <td className="py-3">
                            <div className="font-medium">{line.productName || `Item ${index + 1}`}</div>
                            {line.description && (
                              <div className="text-sm text-gray-600">{line.description}</div>
                            )}
                          </td>
                          <td className="text-center py-3">{line.quantity}</td>
                          <td className="text-right py-3">GH₵{line.unitPrice.toFixed(2)}</td>
                          <td className="text-right py-3">{line.discount}%</td>
                          <td className="text-right py-3 font-medium">GH₵{line.lineTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">GH₵{quotation.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">GH₵{quotation.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg font-bold border-t">
                    <span>Total:</span>
                    <span>GH₵{quotation.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {quotation.notes && (
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Status & Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(quotation.status)}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <div className="mt-1 text-sm text-gray-600">
                    {new Date(quotation.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                {quotation.validUntil && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Valid Until</label>
                    <div className="mt-1 text-sm text-gray-600">
                      {new Date(quotation.validUntil).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/quotations/${quotation.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Quotation
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            {customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <div className="mt-1 text-sm text-gray-900">{customer.name || customer.businessName}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 text-sm text-gray-900">{customer.email}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 text-sm text-gray-900">{customer.phone}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <div className="mt-1 text-sm text-gray-900 capitalize">
                        {quotation.account ? 'Account' : 'Distributor'} • {quotation.customerType?.toLowerCase() || 'standard'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <div className="mt-1 text-sm text-gray-900">{quotation.owner.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 text-sm text-gray-900">{quotation.owner.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
