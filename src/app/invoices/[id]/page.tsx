"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Download, 
  Mail, 
  Calendar, 
  DollarSign, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail as MailIcon,
  MapPin,
  Plus,
  Send,
  CreditCard,
  Receipt,
  Paperclip,
  QrCode,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { AddPaymentModal } from "@/components/modals/add-payment-modal";
import { Package } from "lucide-react";

// Helper function to parse product images
const parseProductImages = (images: string | null | undefined): string[] => {
  if (!images) return [];
  if (typeof images === 'string') {
    try {
      return JSON.parse(images);
    } catch (e) {
      return [];
    }
  }
  if (Array.isArray(images)) {
    return images;
  }
  return [];
};

// Product Image Component
const ProductImage = ({ images, name, size = 'sm' }: { images?: string | null; name: string; size?: 'xs' | 'sm' | 'md' }) => {
  const imageArray = parseProductImages(images);
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8', 
    md: 'h-10 w-10'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {imageArray.length > 0 ? (
        <>
          <img
            src={imageArray[0]}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
          <div className="h-full w-full flex items-center justify-center" style={{display: 'none'}}>
            <Package className="h-3 w-3 text-gray-500" />
          </div>
        </>
      ) : (
        <Package className="h-3 w-3 text-gray-500" />
      )}
    </div>
  );
};

interface Invoice {
  id: string;
  number: string;
  subject: string;
  status: string;
  paymentStatus: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  taxInclusive: boolean;
  notes?: string;
  paymentTerms?: string;
  qrCodeData?: string;
  accountId?: string;
  account?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  distributor?: {
    businessName: string;
    email?: string;
    phone?: string;
  };
  lead?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  lines: Array<{
    id: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
    images?: string | null;
  }>;
  quotation?: {
    id: string;
    number: string;
    subject: string;
  };
}

export default function ViewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoice');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Map line items to include images from product
        const mappedInvoice = {
          ...data.invoice,
          lines: data.invoice.lines.map((line: any) => ({
            ...line,
            productName: line.product?.name || 'Product',
            sku: line.product?.sku || '',
            images: line.product?.images || null
          }))
        };
        setInvoice(mappedInvoice);
      } else {
        showError("Failed to load invoice");
        router.push('/invoices');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      showError("Failed to load invoice");
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showError("Unable to open print window. Please check your popup blocker.");
        return;
      }

      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (response.ok) {
        const htmlContent = await response.text();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
        
        success("Invoice ready for download/printing");
      } else {
        showError("Failed to generate invoice PDF");
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showError("Failed to download invoice");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      SENT: { label: 'Sent', className: 'bg-blue-100 text-blue-800' },
      OVERDUE: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
      VOID: { label: 'Void', className: 'bg-gray-100 text-gray-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      UNPAID: { label: 'Unpaid', className: 'bg-red-100 text-red-800' },
      PARTIALLY_PAID: { label: 'Partially Paid', className: 'bg-yellow-100 text-yellow-800' },
      PAID: { label: 'Paid', className: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.UNPAID;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading invoice...</div>
        </div>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Invoice not found</div>
        </div>
      </MainLayout>
    );
  }

  const customerName = invoice.account?.name || 
                      invoice.distributor?.businessName || 
                      (invoice.lead ? `${invoice.lead.firstName} ${invoice.lead.lastName}`.trim() : '') ||
                      'Unknown Customer';

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/invoices')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Detail</h1>
              <p className="text-gray-600">Dashboard &gt; Invoice Detail</p>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Create Invoice Step */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create Invoice</h3>
                    <p className="text-sm text-gray-500">Created on {new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>

              {/* Progress Line */}
              <div className="flex-1 h-0.5 bg-green-200 mx-4"></div>

              {/* Send Invoice Step */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Send className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Send Invoice</h3>
                    <p className="text-sm text-gray-500">
                      {invoice.status === 'SENT' ? `Sent on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : 'Not sent yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>

              {/* Get Paid Step */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    invoice.paymentStatus === 'PAID' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <DollarSign className={`h-5 w-5 ${
                      invoice.paymentStatus === 'PAID' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
          <div>
                    <h3 className="font-medium text-gray-900">Get Paid</h3>
                    <p className="text-sm text-gray-500">Status: {invoice.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}</p>
                  </div>
                </div>
                {invoice.paymentStatus !== 'PAID' && (
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity bg-blue-600"
                  >
                    <DollarSign className="h-4 w-4 mr-2 inline" />
                    Add Payment
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'invoice' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Invoice
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'receipt' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Receipt Summary
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'credit' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Credit Note Summary
            </button>
            <button
              onClick={() => setActiveTab('attachment')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'attachment' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Attachment
            </button>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Apply Credit Note
            </Button>
            <Button variant="outline" size="sm">
              <Receipt className="h-4 w-4 mr-2" />
              Receipt Reminder
            </Button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity bg-blue-600"
            >
              <Send className="h-4 w-4 mr-2 inline" />
              Resend Invoice
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-md text-white hover:opacity-90 transition-opacity bg-blue-600"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2 inline" />
              Download
            </button>
          </div>
        </div>

          {/* Main Content */}
        {activeTab === 'invoice' && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Invoice</h2>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>Issue Date: {new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      <span>Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                      </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-2">#{invoice.number}</div>
                    {getStatusBadge(invoice.status)}
                      </div>
                      </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Billed To */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Billed To :</h3>
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{customerName}</div>
                      <div className="text-gray-600">
                        {invoice.account?.email || invoice.distributor?.email || invoice.lead?.email}
                      </div>
                      <div className="text-gray-600">
                        {invoice.account?.phone || invoice.distributor?.phone || invoice.lead?.phone}
                      </div>
                      <div className="text-gray-600 mt-2">Tax Number: -</div>
                    </div>
                  </div>

                  {/* Shipped To */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Shipped To :</h3>
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{customerName}</div>
                      <div className="text-gray-600">
                        {invoice.account?.email || invoice.distributor?.email || invoice.lead?.email}
                      </div>
                      <div className="text-gray-600">
                        {invoice.account?.phone || invoice.distributor?.phone || invoice.lead?.phone}
                        </div>
                    </div>
                  </div>

                  {/* Status and QR Code */}
                  <div className="text-center">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Status :</h3>
                      {getStatusBadge(invoice.status)}
                    </div>
                    {invoice.qrCodeData ? (
                      <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mx-auto p-2">
                        <img 
                          src={invoice.qrCodeData} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                        />
                </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                        <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Item Summary */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Summary</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-600">
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ITEM TYPE</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ITEM</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">QUANTITY</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">RATE</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">DISCOUNT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">TAX</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">DESCRIPTION</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">PRICE AFTER<br/>DISCOUNT & TAX</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.lines.map((line, index) => (
                        <tr key={line.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Product</td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="flex items-center space-x-3">
                              <ProductImage images={line.images} name={line.productName} size="sm" />
                              <span>{line.productName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{line.quantity}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">GH₵{line.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">GH₵{line.discount.toFixed(2)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            VAT (15%) GH₵{((line.lineTotal - line.discount) * 0.15).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                            {line.productName} - Professional service delivery
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            GH₵{line.lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other Tabs Content */}
        {activeTab === 'receipt' && (
            <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt Summary</h2>
              <p className="text-gray-600">Receipt information will be displayed here.</p>
              </CardContent>
            </Card>
        )}

        {activeTab === 'credit' && (
              <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit Note Summary</h2>
              <p className="text-gray-600">Credit note information will be displayed here.</p>
                </CardContent>
              </Card>
            )}

        {activeTab === 'attachment' && (
            <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
              <p className="text-gray-600">Invoice attachments will be displayed here.</p>
              </CardContent>
            </Card>
        )}
      </div>

      {/* Payment Modal */}
      {invoice && (
        <AddPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            loadInvoice(); // Reload invoice to show updated payment status
            setShowPaymentModal(false);
          }}
          accountId={invoice.accountId || invoice.account?.id || ''}
          accountName={invoice.account?.name || 'Unknown Customer'}
          preSelectedInvoice={{
            id: invoice.id,
            number: invoice.number,
            total: invoice.total,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue
          }}
        />
      )}
    </MainLayout>
  );
}
