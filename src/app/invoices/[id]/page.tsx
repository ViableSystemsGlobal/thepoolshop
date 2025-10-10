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
  MapPin
} from "lucide-react";
import Link from "next/link";

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
  account?: {
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
        setInvoice(data.invoice);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.number}</h1>
            <p className="text-gray-600">{invoice.subject}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Invoice
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Invoice Number:</span>
                        <span className="text-sm font-medium">{invoice.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Issue Date:</span>
                        <span className="text-sm font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Due Date:</span>
                        <span className="text-sm font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        {getPaymentStatusBadge(invoice.paymentStatus)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{customerName}</span>
                      </div>
                      {invoice.account?.email || invoice.distributor?.email || invoice.lead?.email ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <MailIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{invoice.account?.email || invoice.distributor?.email || invoice.lead?.email}</span>
                        </div>
                      ) : null}
                      {invoice.account?.phone || invoice.distributor?.phone || invoice.lead?.phone ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{invoice.account?.phone || invoice.distributor?.phone || invoice.lead?.phone}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {invoice.paymentTerms && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Terms</h3>
                    <p className="text-sm text-gray-900">{invoice.paymentTerms}</p>
                  </div>
                )}

                {invoice.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <p className="text-sm text-gray-900">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.lines.map((line, index) => (
                        <tr key={line.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{line.productName}</div>
                            <div className="text-sm text-gray-500">SKU: {line.sku}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{line.quantity}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">GH₵{line.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{line.discount}%</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">GH₵{line.lineTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-sm font-medium">GH₵{invoice.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount Paid:</span>
                    <span className="text-sm font-medium text-green-600">GH₵{invoice.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Amount Due:</span>
                    <span className="text-sm font-bold text-red-600">GH₵{invoice.amountDue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Quotation */}
            {invoice.quotation && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Quotation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Quotation:</span>
                      <Link 
                        href={`/quotations/${invoice.quotation.id}`}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {invoice.quotation.number}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-600">{invoice.quotation.subject}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                  <Link href={`/invoices/${invoice.id}/edit`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Invoice
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
