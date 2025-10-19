"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import { MiniLineChart } from "@/components/ui/mini-line-chart";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  PieChart,
  LineChart,
  Activity,
  Building2,
  Target,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Clock,
  UserPlus,
  CheckCircle,
  AlertCircle,
  UserCog
} from "lucide-react";

interface ReportData {
  sales: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    aov: number;
    topProducts: Array<{
      name: string;
      revenue: number;
      quantity: number;
    }>;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
    }>;
    revenueTrend: number[];
    dailyRevenue: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    customerGrowth: number;
    topCustomers: Array<{
      name: string;
      revenue: number;
      orders: number;
    }>;
    customersTrend: number[];
  };
  inventory: {
    totalProducts: number;
    lowStockItems: number;
    totalValue: number;
    totalStockUnits: number;
    topMovingProducts: Array<{
      name: string;
      quantity: number;
      value: number;
    }>;
    productsTrend: number[];
  };
  quotations: {
    totalQuotations: number;
    pendingQuotations: number;
    conversionRate: number;
    quotationsByStatus: Array<{
      status: string;
      count: number;
    }>;
    quotationsTrend: number[];
  };
  invoices: {
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    totalOutstanding: number;
  };
  crm: {
    totalLeads: number;
    newLeads: number;
    totalOpportunities: number;
    wonOpportunities: number;
    leadConversionRate: number;
    opportunityWinRate: number;
    leadsBySource: Array<{
      source: string;
      count: number;
    }>;
  };
  drm: {
    totalDistributors: number;
    activeDistributors: number;
    newDistributors: number;
    distributorLeads: number;
    distributorConversionRate: number;
    topDistributors: Array<{
      name: string;
      region: string;
      orders: number;
      revenue: number;
    }>;
  };
  agents: {
    totalAgents: number;
    activeAgents: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    topPerformers: Array<{
      name: string;
      agentCode: string;
      totalCommissions: number;
      commissionCount: number;
      territory: string;
    }>;
    commissionsByStatus: Array<{
      status: string;
      count: number;
      amount: number;
    }>;
    commissionsByMonth: Array<{
      month: string;
      amount: number;
      count: number;
    }>;
  };
}

export default function ReportsPage() {
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const themeColor = getThemeColor();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTabs, setSelectedTabs] = useState<string[]>(['overview']);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount: number) => {
    return `GH₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendColor = (trend: number[]) => {
    if (trend.length < 2) return "#16a34a"; // Default green
    
    const first = trend[0];
    const last = trend[trend.length - 1];
    const isPositive = last > first;
    
    return isPositive ? "#16a34a" : "#dc2626"; // Green for positive, red for negative
  };

  const getTrendIcon = (trend: number[] | undefined) => {
    if (!trend || trend.length < 2) return <TrendingUp className="h-3 w-3 mr-1 text-green-500" />;
    
    const first = trend[0];
    const last = trend[trend.length - 1];
    const isPositive = last > first;
    
    return isPositive 
      ? <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
      : <TrendingUp className="h-3 w-3 mr-1 text-red-500 rotate-180" />;
  };

  const toggleTab = (tab: string) => {
    setSelectedTabs(prev => 
      prev.includes(tab) 
        ? prev.filter(t => t !== tab)
        : [...prev, tab]
    );
  };

  const handleExportExcel = async () => {
    if (!reportData) return;

    const workbook = XLSX.utils.book_new();

    selectedTabs.forEach(tab => {
      let data: any[] = [];
      let sheetName = '';

      switch (tab) {
        case 'overview':
          sheetName = 'Overview';
          data = [
            ['Business Overview Report'],
            ['Period', selectedPeriod],
            ['Generated', new Date().toLocaleString()],
            [],
            ['Key Metrics'],
            ['Total Revenue', formatCurrency(reportData.sales.totalRevenue)],
            ['Total Customers', reportData.customers.totalCustomers],
            ['Total Products', reportData.inventory.totalProducts],
            ['Conversion Rate', `${reportData.quotations.conversionRate.toFixed(1)}%`],
            [],
            ['Top Products'],
            ['Rank', 'Product', 'Revenue', 'Quantity'],
            ...reportData.sales.topProducts.map((p, i) => [i + 1, p.name, p.revenue, p.quantity])
          ];
          break;

        case 'sales':
          sheetName = 'Sales';
          data = [
            ['Sales Report'],
            ['Period', selectedPeriod],
            [],
            ['Metrics'],
            ['Total Revenue', reportData.sales.monthlyRevenue],
            ['Total Orders', reportData.sales.totalOrders],
            ['AOV', reportData.sales.aov],
            ['Growth Rate', `${reportData.sales.revenueGrowth.toFixed(1)}%`],
            [],
            ['Top Products'],
            ['Rank', 'Product', 'Revenue', 'Quantity', 'Avg Price'],
            ...reportData.sales.topProducts.map((p, i) => [
              i + 1, p.name, p.revenue, p.quantity, p.revenue / p.quantity
            ])
          ];
          break;

        case 'customers':
          sheetName = 'Customers';
          data = [
            ['Customer Report'],
            ['Period', selectedPeriod],
            [],
            ['Metrics'],
            ['Total Customers', reportData.customers.totalCustomers],
            ['New Customers', reportData.customers.newCustomers],
            ['Growth Rate', `${reportData.customers.customerGrowth.toFixed(1)}%`],
            [],
            ['Top Customers'],
            ['Rank', 'Customer', 'Revenue', 'Orders'],
            ...reportData.customers.topCustomers.map((c, i) => [
              i + 1, c.name, c.revenue, c.orders
            ])
          ];
          break;

        case 'crm':
          if (reportData.crm) {
            sheetName = 'CRM';
            data = [
              ['CRM Report'],
              ['Period', selectedPeriod],
              [],
              ['Metrics'],
              ['Total Leads', reportData.crm.totalLeads],
              ['New Leads', reportData.crm.newLeads],
              ['Opportunities', reportData.crm.totalOpportunities],
              ['Won Deals', reportData.crm.wonOpportunities],
              ['Lead Conversion', `${reportData.crm.leadConversionRate.toFixed(1)}%`],
              ['Win Rate', `${reportData.crm.opportunityWinRate.toFixed(1)}%`],
              [],
              ['Lead Sources'],
              ['Source', 'Count'],
              ...reportData.crm.leadsBySource.map(s => [s.source, s.count])
            ];
          }
          break;

        case 'drm':
          if (reportData.drm) {
            sheetName = 'DRM';
            data = [
              ['DRM Report'],
              ['Period', selectedPeriod],
              [],
              ['Metrics'],
              ['Total Distributors', reportData.drm.totalDistributors],
              ['Active Partners', reportData.drm.activeDistributors],
              ['New Partners', reportData.drm.newDistributors],
              ['Distributor Leads', reportData.drm.distributorLeads],
              ['Conversion Rate', `${reportData.drm.distributorConversionRate.toFixed(1)}%`],
              [],
              ['Top Distributors'],
              ['Rank', 'Name', 'Region', 'Orders', 'Revenue'],
              ...reportData.drm.topDistributors.map((d, i) => [
                i + 1, d.name, d.region, d.orders, d.revenue
              ])
            ];
          }
          break;

        case 'inventory':
          sheetName = 'Inventory';
          data = [
            ['Inventory Report'],
            ['Period', selectedPeriod],
            [],
            ['Metrics'],
            ['Total Products', reportData.inventory.totalProducts],
            ['Low Stock Items', reportData.inventory.lowStockItems],
            ['Total Stock Value', reportData.inventory.totalValue],
            [],
            ['Top Moving Products'],
            ['Rank', 'Product', 'Quantity', 'Value'],
            ...reportData.inventory.topMovingProducts.map((p, i) => [
              i + 1, p.name, p.quantity, p.value
            ])
          ];
          break;

        case 'quotations':
          sheetName = 'Quotations';
          data = [
            ['Quotations Report'],
            ['Period', selectedPeriod],
            [],
            ['Metrics'],
            ['Total Quotations', reportData.quotations.totalQuotations],
            ['Pending', reportData.quotations.pendingQuotations],
            ['Conversion Rate', `${reportData.quotations.conversionRate.toFixed(1)}%`],
            [],
            ['Quotations by Status'],
            ['Status', 'Count', 'Percentage'],
            ...reportData.quotations.quotationsByStatus.map(s => [
              s.status, 
              s.count, 
              `${((s.count / reportData.quotations.totalQuotations) * 100).toFixed(1)}%`
            ])
          ];
          break;

        case 'agents':
          sheetName = 'Agents';
          data = [
            ['Agents Report'],
            ['Period', selectedPeriod],
            [],
            ['Metrics'],
            ['Total Agents', reportData.agents.totalAgents],
            ['Active Agents', reportData.agents.activeAgents],
            ['Total Commissions', `GH₵${reportData.agents.totalCommissions.toLocaleString()}`],
            ['Pending Commissions', `GH₵${reportData.agents.pendingCommissions.toLocaleString()}`],
            ['Paid Commissions', `GH₵${reportData.agents.paidCommissions.toLocaleString()}`],
            [],
            ['Top Performers'],
            ['Name', 'Agent Code', 'Total Commissions', 'Commission Count', 'Territory'],
            ...reportData.agents.topPerformers.map(agent => [
              agent.name,
              agent.agentCode,
              `GH₵${agent.totalCommissions.toLocaleString()}`,
              agent.commissionCount,
              agent.territory
            ]),
            [],
            ['Commissions by Status'],
            ['Status', 'Count', 'Amount'],
            ...reportData.agents.commissionsByStatus.map(status => [
              status.status,
              status.count,
              `GH₵${status.amount.toLocaleString()}`
            ])
          ];
          break;
      }

      if (data.length > 0) {
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });

    const fileName = `Business_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportPDF = async () => {
    if (!reportData) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add company name and title
    pdf.setFontSize(20);
    pdf.text('Business Reports', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(`Period: ${selectedPeriod} | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Store original selected report
    const originalReport = selectedReport;

    for (const tab of selectedTabs) {
      // Switch to the tab to make charts visible
      setSelectedReport(tab);
      
      // Wait for the tab to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Add section title
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(tab.charAt(0).toUpperCase() + tab.slice(1) + ' Report', 15, yPosition);
      yPosition += 10;

      // Try to capture charts with improved error handling
      let chartsFound = false;
      
      try {
        // First, try to capture individual chart containers
        const chartContainers = document.querySelectorAll(`[data-report-tab="${tab}"] .h-80, [data-report-tab="${tab}"] .h-96, [data-report-tab="${tab}"] [class*="h-"]`);
        
        for (let i = 0; i < chartContainers.length; i++) {
          const container = chartContainers[i] as HTMLElement;
          
          // Skip if element is not visible or too small
          if (container.offsetWidth < 200 || container.offsetHeight < 150) {
            continue;
          }
          
          try {
            const canvas = await html2canvas(container, {
              scale: 1.5,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: false,
              allowTaint: false,
              foreignObjectRendering: false,
              removeContainer: true,
              width: container.offsetWidth,
              height: container.offsetHeight
            });

            if (canvas.width > 0 && canvas.height > 0) {
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = pageWidth - 30;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              // Check if image fits on current page
              if (yPosition + imgHeight > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
              }

              pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
              yPosition += imgHeight + 10;
              chartsFound = true;
            }
          } catch (chartError) {
            console.warn('Failed to capture individual chart:', chartError);
            continue;
          }
        }

        // If no individual charts captured, try to capture the entire tab content
        if (!chartsFound) {
          const tabElement = document.querySelector(`[data-report-tab="${tab}"]`) as HTMLElement;
          if (tabElement && tabElement.offsetHeight > 0) {
            try {
              const canvas = await html2canvas(tabElement, {
                scale: 1.2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: false,
                allowTaint: false,
                foreignObjectRendering: false,
                removeContainer: true,
                width: tabElement.offsetWidth,
                height: Math.min(tabElement.offsetHeight, 2000) // Limit height to prevent huge images
              });

              if (canvas.width > 0 && canvas.height > 0) {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 30;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Check if image fits on current page
                if (yPosition + imgHeight > pageHeight - 20) {
                  pdf.addPage();
                  yPosition = 20;
                }

                pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 10;
                chartsFound = true;
              }
            } catch (tabError) {
              console.warn('Failed to capture tab content:', tabError);
            }
          }
        }

        // If still no charts found, add a text-based chart representation
        if (!chartsFound) {
          pdf.setFontSize(12);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Chart data summary:', 15, yPosition);
          yPosition += 8;
          
          // Add chart data as text based on tab type
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          
          switch (tab) {
            case 'overview':
              if (reportData.sales.topProducts.length > 0) {
                pdf.text('Top Products:', 15, yPosition);
                yPosition += 6;
                reportData.sales.topProducts.slice(0, 5).forEach((product, index) => {
                  pdf.text(`${index + 1}. ${product.name}: ${formatCurrency(product.revenue)}`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;
              
            case 'sales':
              if (reportData.sales.topProducts.length > 0) {
                pdf.text('Top Performing Products:', 15, yPosition);
                yPosition += 6;
                reportData.sales.topProducts.slice(0, 5).forEach((product, index) => {
                  pdf.text(`${index + 1}. ${product.name}: ${formatCurrency(product.revenue)}`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;
              
            case 'customers':
              if (reportData.customers.topCustomers.length > 0) {
                pdf.text('Top Customers:', 15, yPosition);
                yPosition += 6;
                reportData.customers.topCustomers.slice(0, 5).forEach((customer, index) => {
                  pdf.text(`${index + 1}. ${customer.name}: ${formatCurrency(customer.revenue)}`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;
              
            case 'crm':
              if (reportData.crm && reportData.crm.leadsBySource.length > 0) {
                pdf.text('Lead Sources:', 15, yPosition);
                yPosition += 6;
                reportData.crm.leadsBySource.forEach((source, index) => {
                  pdf.text(`${source.source}: ${source.count} leads`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;
              
            case 'drm':
              if (reportData.drm && reportData.drm.topDistributors.length > 0) {
                pdf.text('Top Distributors:', 15, yPosition);
                yPosition += 6;
                reportData.drm.topDistributors.slice(0, 5).forEach((dist, index) => {
                  pdf.text(`${index + 1}. ${dist.name}: ${dist.orders} orders`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;
              
            case 'inventory':
              if (reportData.inventory.topMovingProducts.length > 0) {
                pdf.text('Top Moving Products:', 15, yPosition);
                yPosition += 6;
                reportData.inventory.topMovingProducts.slice(0, 5).forEach((product, index) => {
                  pdf.text(`${index + 1}. ${product.name}: ${product.quantity} units`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;
              
            case 'quotations':
              if (reportData.quotations.quotationsByStatus.length > 0) {
                pdf.text('Quotation Status:', 15, yPosition);
                yPosition += 6;
                reportData.quotations.quotationsByStatus.forEach((status, index) => {
                  pdf.text(`${status.status}: ${status.count} quotations`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;

            case 'agents':
              if (reportData.agents.topPerformers.length > 0) {
                pdf.text('Top Performers:', 15, yPosition);
                yPosition += 6;
                reportData.agents.topPerformers.forEach((agent, index) => {
                  pdf.text(`${agent.name} (${agent.agentCode}): GH₵${agent.totalCommissions.toLocaleString()}`, 20, yPosition);
                  yPosition += 5;
                });
              }
              if (reportData.agents.commissionsByStatus.length > 0) {
                pdf.text('Commissions by Status:', 15, yPosition);
                yPosition += 6;
                reportData.agents.commissionsByStatus.forEach((status, index) => {
                  pdf.text(`${status.status}: ${status.count} (GH₵${status.amount.toLocaleString()})`, 20, yPosition);
                  yPosition += 5;
                });
              }
              break;
          }
          
          yPosition += 10;
        }

      } catch (error) {
        console.warn('Chart capture failed for tab:', tab, error);
        // Add a note that charts couldn't be captured
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Charts could not be captured for this section', 15, yPosition);
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.text('Note: This may be due to browser security restrictions.', 15, yPosition);
        yPosition += 15;
      }

      // Add metrics data as text
      pdf.setFontSize(10);
      
      switch (tab) {
        case 'overview':
          pdf.text(`Revenue: ${formatCurrency(reportData.sales.totalRevenue)}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Customers: ${reportData.customers.totalCustomers}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Products: ${reportData.inventory.totalProducts}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Conversion Rate: ${reportData.quotations.conversionRate.toFixed(1)}%`, 15, yPosition);
          yPosition += 15;
          break;

        case 'sales':
          pdf.text(`Total Revenue: ${formatCurrency(reportData.sales.monthlyRevenue)}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Total Orders: ${reportData.sales.totalOrders}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`AOV: ${formatCurrency(reportData.sales.aov)}`, 15, yPosition);
          yPosition += 15;
          break;

        case 'customers':
          pdf.text(`Total Customers: ${reportData.customers.totalCustomers}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`New Customers: ${reportData.customers.newCustomers}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Growth Rate: ${formatPercentage(reportData.customers.customerGrowth)}`, 15, yPosition);
          yPosition += 15;
          break;

        case 'crm':
          if (reportData.crm) {
            pdf.text(`Total Leads: ${reportData.crm.totalLeads}`, 15, yPosition);
            yPosition += 7;
            pdf.text(`Opportunities: ${reportData.crm.totalOpportunities}`, 15, yPosition);
            yPosition += 7;
            pdf.text(`Win Rate: ${reportData.crm.opportunityWinRate.toFixed(1)}%`, 15, yPosition);
            yPosition += 15;
          }
          break;

        case 'drm':
          if (reportData.drm) {
            pdf.text(`Total Distributors: ${reportData.drm.totalDistributors}`, 15, yPosition);
            yPosition += 7;
            pdf.text(`Active Partners: ${reportData.drm.activeDistributors}`, 15, yPosition);
            yPosition += 7;
            pdf.text(`Conversion Rate: ${reportData.drm.distributorConversionRate.toFixed(1)}%`, 15, yPosition);
            yPosition += 15;
          }
          break;

        case 'inventory':
          pdf.text(`Total Products: ${reportData.inventory.totalProducts}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Low Stock Items: ${reportData.inventory.lowStockItems}`, 15, yPosition);
          yPosition += 15;
          break;

        case 'quotations':
          pdf.text(`Total Quotations: ${reportData.quotations.totalQuotations}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Conversion Rate: ${reportData.quotations.conversionRate.toFixed(1)}%`, 15, yPosition);
          yPosition += 15;
          break;

        case 'agents':
          pdf.text(`Total Agents: ${reportData.agents.totalAgents}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Active Agents: ${reportData.agents.activeAgents}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Total Commissions: GH₵${reportData.agents.totalCommissions.toLocaleString()}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Pending Commissions: GH₵${reportData.agents.pendingCommissions.toLocaleString()}`, 15, yPosition);
          yPosition += 7;
          pdf.text(`Paid Commissions: GH₵${reportData.agents.paidCommissions.toLocaleString()}`, 15, yPosition);
          yPosition += 15;
          break;
      }
    }

    // Restore original selected report
    setSelectedReport(originalReport);

    const fileName = `Business_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    setShowExportModal(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === 'excel') {
        await handleExportExcel();
      } else {
        await handleExportPDF();
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button
              onClick={fetchReportData}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2"
              style={{ backgroundColor: themeColor, color: 'white' }}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sales', label: 'Sales', icon: TrendingUp },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'crm', label: 'CRM', icon: Users },
            { id: 'drm', label: 'DRM', icon: Building2 },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'quotations', label: 'Quotations', icon: FileText },
            { id: 'agents', label: 'Agents', icon: UserCog }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedReport === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overview Report */}
        {selectedReport === 'overview' && reportData && (
          <div className="space-y-6" data-report-tab="overview">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <DollarSign className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.sales.totalRevenue)}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.sales.revenueTrend)}
                      {formatPercentage(reportData.sales.revenueGrowth)} from last period
                    </div>
                    <MiniLineChart 
                      data={reportData.sales.revenueTrend} 
                      color={getTrendColor(reportData.sales.revenueTrend)} 
                      width={80} 
                      height={24} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Users className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.customers.totalCustomers.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.customers.customersTrend)}
                      {reportData.customers.newCustomers} new this period
                    </div>
                    <MiniLineChart 
                      data={reportData.customers.customersTrend} 
                      color={getTrendColor(reportData.customers.customersTrend)} 
                      width={80} 
                      height={24} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Package className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.inventory.totalProducts.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.inventory.productsTrend)}
                      {reportData.inventory.lowStockItems} low stock items
                    </div>
                    <MiniLineChart 
                      data={reportData.inventory.productsTrend} 
                      color={getTrendColor(reportData.inventory.productsTrend)} 
                      width={80} 
                      height={24} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <FileText className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.quotations.conversionRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.quotations.quotationsTrend)}
                      {reportData.quotations.pendingQuotations} pending quotations
                    </div>
                    <MiniLineChart 
                      data={reportData.quotations.quotationsTrend} 
                      color={getTrendColor(reportData.quotations.quotationsTrend)} 
                      width={80} 
                      height={24} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 - Revenue & Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Daily revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsAreaChart data={reportData.sales.dailyRevenue}>
                      <defs>
                        <linearGradient id="overviewRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        tickFormatter={(value) => `GH₵${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [`GH₵${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={themeColor} 
                        strokeWidth={2}
                        fill="url(#overviewRevenueGradient)"
                      />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Acquisition Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Customer Acquisition
                  </CardTitle>
                  <CardDescription>New customers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsAreaChart data={reportData.customers.customersTrend.map((count, index) => ({
                      day: `Day ${index + 1}`,
                      customers: count
                    }))}>
                      <defs>
                        <linearGradient id="overviewCustomersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'New Customers']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        stroke={themeColor} 
                        strokeWidth={2}
                        fill="url(#overviewCustomersGradient)"
                      />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 - Products & Quotations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Top Products by Revenue
                  </CardTitle>
                  <CardDescription>Best performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.sales.topProducts.slice(0, 5)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        tickFormatter={(value) => `GH₵${(value / 1000).toFixed(0)}k`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        width={120}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [`GH₵${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill={themeColor}
                        radius={[0, 8, 8, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quotation Status Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Quotation Pipeline
                  </CardTitle>
                  <CardDescription>Quotations by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.quotations.quotationsByStatus}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="status" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Quotations']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={themeColor}
                        radius={[8, 8, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* Sales Report */}
        {selectedReport === 'sales' && reportData && (
          <div className="space-y-6" data-report-tab="sales">
            {/* Enhanced Sales Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <DollarSign className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.sales.monthlyRevenue)}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.sales.revenueTrend)}
                      {formatPercentage(reportData.sales.revenueGrowth)}
                    </div>
                    <MiniLineChart 
                      data={reportData.sales.revenueTrend} 
                      color={getTrendColor(reportData.sales.revenueTrend)} 
                      width={60} 
                      height={20} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <FileText className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.sales.totalOrders}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Paid invoices
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">AOV</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <TrendingUp className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.sales.aov)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <DollarSign className="h-3 w-3 mr-1 text-purple-500" />
                    Average order value
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Paid Invoices</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <CheckCircle className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.invoices.paidInvoices}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <FileText className="h-3 w-3 mr-1 text-blue-500" />
                    of {reportData.invoices.totalInvoices} total
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Outstanding</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Clock className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.invoices.totalOutstanding)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <AlertCircle className="h-3 w-3 mr-1 text-orange-500" />
                    {reportData.invoices.overdueInvoices} overdue
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Daily revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsAreaChart data={reportData.sales.dailyRevenue}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        tickFormatter={(value) => `GH₵${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [`GH₵${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={themeColor} 
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders Trend Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Orders Trend
                  </CardTitle>
                  <CardDescription>Daily orders over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={reportData.sales.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill={themeColor} 
                        radius={[8, 8, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top & Worst Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Products */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Performing Products
                  </CardTitle>
                  <CardDescription>Best selling products by revenue this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.sales.topProducts.slice(0, 5).map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-green-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(product.revenue / product.quantity)}/unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Worst Performing Products */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-red-600 rotate-180" />
                    Worst Performing Products
                  </CardTitle>
                  <CardDescription>Lowest selling products by revenue this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.sales.topProducts.length > 0 ? (
                      [...reportData.sales.topProducts]
                        .reverse()
                        .slice(0, 5)
                        .map((product, index) => (
                          <div key={product.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-red-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-medium text-red-700">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                              <p className="text-xs text-gray-500">{formatCurrency(product.revenue / product.quantity)}/unit</p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">No product data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Customers Report */}
        {selectedReport === 'customers' && reportData && (
          <div className="space-y-6" data-report-tab="customers">
            {/* Enhanced Customer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Users className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.customers.totalCustomers.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.customers.customersTrend)}
                      All time
                    </div>
                    <MiniLineChart 
                      data={reportData.customers.customersTrend} 
                      color={getTrendColor(reportData.customers.customersTrend)} 
                      width={60} 
                      height={20} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">New Customers</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <UserPlus className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.customers.newCustomers}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                    This {selectedPeriod === '7d' ? 'week' : selectedPeriod === '30d' ? 'month' : 'period'}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Growth Rate</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <TrendingUp className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPercentage(reportData.customers.customerGrowth)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Customer acquisition
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Revenue</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <DollarSign className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.sales.monthlyRevenue / Math.max(reportData.customers.totalCustomers, 1))}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Users className="h-3 w-3 mr-1 text-purple-500" />
                    Per customer
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">CLV</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Target className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.sales.totalRevenue / Math.max(reportData.customers.totalCustomers, 1))}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Customer lifetime value
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Acquisition Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Customer Acquisition Trend
                  </CardTitle>
                  <CardDescription>New customers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsAreaChart data={reportData.customers.customersTrend.map((count, index) => ({
                      day: `Day ${index + 1}`,
                      customers: count
                    }))}>
                      <defs>
                        <linearGradient id="customersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'New Customers']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        stroke={themeColor} 
                        strokeWidth={2}
                        fill="url(#customersGradient)"
                      />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Distribution Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Customer Segmentation
                  </CardTitle>
                  <CardDescription>Customers by value tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={[
                        { tier: 'High Value', customers: Math.floor(reportData.customers.totalCustomers * 0.2), color: '#16a34a' },
                        { tier: 'Medium Value', customers: Math.floor(reportData.customers.totalCustomers * 0.5), color: themeColor },
                        { tier: 'Low Value', customers: Math.floor(reportData.customers.totalCustomers * 0.3), color: '#94a3b8' }
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        type="category"
                        dataKey="tier"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Customers']}
                      />
                      <Bar 
                        dataKey="customers" 
                        fill={themeColor}
                        radius={[0, 8, 8, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top & Bottom Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Customers */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Customers by Revenue
                  </CardTitle>
                  <CardDescription>Highest value customers this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.customers.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={customer.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-green-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.revenue)}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(customer.revenue / Math.max(customer.orders, 1))}/order</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Customers */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Customers
                  </CardTitle>
                  <CardDescription>Newest customers this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.customers.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={customer.name + '-recent'} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">Joined recently</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.revenue)}</p>
                          <p className="text-xs text-gray-500">{customer.orders} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CRM Report */}
        {selectedReport === 'crm' && reportData && !reportData.crm && (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Activity className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading CRM Data...</h3>
              <p className="text-gray-500">Please refresh the page if this persists.</p>
            </CardContent>
          </Card>
        )}

        {selectedReport === 'crm' && reportData && reportData.crm && (
          <div className="space-y-6" data-report-tab="crm">
            {/* Enhanced CRM Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Target className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.crm.totalLeads}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Target className="h-3 w-3 mr-1 text-blue-500" />
                    {reportData.crm.newLeads} new this period
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Opportunities</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <TrendingUp className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.crm.totalOpportunities}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1 text-orange-500" />
                    In pipeline
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Lead Conversion</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <BarChart3 className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.crm.leadConversionRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Lead to won
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <CheckCircle className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.crm.opportunityWinRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Target className="h-3 w-3 mr-1 text-purple-500" />
                    Opportunity win rate
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Deal Size</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <DollarSign className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.sales.monthlyRevenue / Math.max(reportData.crm.wonOpportunities, 1))}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <FileText className="h-3 w-3 mr-1 text-blue-500" />
                    Per won deal
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Funnel Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Sales Funnel
                  </CardTitle>
                  <CardDescription>Conversion through sales pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={[
                        { stage: 'Leads', count: reportData.crm.totalLeads },
                        { stage: 'Opportunities', count: reportData.crm.totalOpportunities },
                        { stage: 'Won', count: reportData.crm.wonOpportunities }
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        type="category"
                        dataKey="stage"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Count']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={themeColor}
                        radius={[0, 8, 8, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lead Sources Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Lead Sources
                  </CardTitle>
                  <CardDescription>Where your leads come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.crm.leadsBySource}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="source" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Leads']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={themeColor}
                        radius={[8, 8, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* CRM Performance Summary */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Pipeline Performance
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Lead Quality</span>
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{reportData.crm.leadConversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportData.crm.wonOpportunities} won / {reportData.crm.totalLeads} leads
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Close Rate</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{reportData.crm.opportunityWinRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportData.crm.wonOpportunities} won / {reportData.crm.totalOpportunities} opportunities
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Pipeline Value</span>
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.sales.monthlyRevenue)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total revenue from won deals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* DRM Report */}
        {selectedReport === 'drm' && reportData && !reportData.drm && (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading DRM Data...</h3>
              <p className="text-gray-500">Please refresh the page if this persists.</p>
            </CardContent>
          </Card>
        )}

        {selectedReport === 'drm' && reportData && reportData.drm && (
          <div className="space-y-6" data-report-tab="drm">
            {/* Enhanced DRM Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Distributors</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Building2 className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.drm.totalDistributors}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Building2 className="h-3 w-3 mr-1 text-blue-500" />
                    All partners
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Partners</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <CheckCircle className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.drm.activeDistributors}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Active status
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">New Partners</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <UserPlus className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.drm.newDistributors}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1 text-purple-500" />
                    This period
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Distributor Leads</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Target className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.drm.distributorLeads}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Target className="h-3 w-3 mr-1 text-orange-500" />
                    This period
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <TrendingUp className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.drm.distributorConversionRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Lead to partner
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distributor Performance Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Distributor Performance
                  </CardTitle>
                  <CardDescription>Top distributors by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.drm.topDistributors}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        tickFormatter={(value) => `GH₵${(value / 1000).toFixed(0)}k`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        width={150}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [`GH₵${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill={themeColor}
                        radius={[0, 8, 8, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distributor Activity Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Distributor Activity
                  </CardTitle>
                  <CardDescription>Orders by distributor</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.drm.topDistributors}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill={themeColor}
                        radius={[8, 8, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Distributors List */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Top Performing Distributors
                </CardTitle>
                <CardDescription>Ranked by orders and revenue this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.drm.topDistributors.length > 0 ? (
                    reportData.drm.topDistributors.map((distributor, index) => (
                      <div key={distributor.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full bg-${theme.primaryBg} flex items-center justify-center text-sm font-medium text-${theme.primary}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{distributor.name}</p>
                            <p className="text-xs text-gray-500">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {distributor.region} • {distributor.orders} orders
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(distributor.revenue)}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(distributor.revenue / Math.max(distributor.orders, 1))}/order</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No distributor data available for this period</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inventory Report */}
        {selectedReport === 'inventory' && reportData && (
          <div className="space-y-6" data-report-tab="inventory">
            {/* Enhanced Inventory Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Package className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.inventory.totalProducts.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.inventory.productsTrend)}
                      {reportData.inventory.productsTrend.reduce((a, b) => a + b, 0)} new
                    </div>
                    <MiniLineChart 
                      data={reportData.inventory.productsTrend} 
                      color={getTrendColor(reportData.inventory.productsTrend)} 
                      width={60} 
                      height={20} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <AlertCircle className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.inventory.lowStockItems}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <AlertCircle className="h-3 w-3 mr-1 text-orange-500" />
                    Need restocking
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Stock Value</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <DollarSign className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.inventory.totalValue)}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Package className="h-3 w-3 mr-1 text-blue-500" />
                    All warehouses
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Stock Units</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Package className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.inventory.totalStockUnits.toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Package className="h-3 w-3 mr-1 text-purple-500" />
                    Total units
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Stock Health</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <CheckCircle className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {((reportData.inventory.totalProducts - reportData.inventory.lowStockItems) / reportData.inventory.totalProducts * 100).toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Well stocked
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Levels Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Stock Levels
                  </CardTitle>
                  <CardDescription>Current inventory by top products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.inventory.topMovingProducts.slice(0, 8)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Units in Stock']}
                      />
                      <Bar 
                        dataKey="quantity" 
                        fill={themeColor}
                        radius={[8, 8, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inventory Value Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Inventory Value
                  </CardTitle>
                  <CardDescription>Value by top products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.inventory.topMovingProducts.slice(0, 8)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                        tickFormatter={(value) => `GH₵${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [`GH₵${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Value']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill={themeColor}
                        radius={[8, 8, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top & Low Stock Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Moving Products */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Moving Products
                  </CardTitle>
                  <CardDescription>Products with highest stock quantity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.inventory.topMovingProducts.slice(0, 5).map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-green-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.quantity} units in stock</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(product.value)}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(product.value / Math.max(product.quantity, 1))}/unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription>Products requiring immediate restocking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.inventory.topMovingProducts.length > 0 ? (
                      [...reportData.inventory.topMovingProducts]
                        .sort((a, b) => a.quantity - b.quantity)
                        .slice(0, 5)
                        .map((product, index) => (
                          <div key={product.name + '-low'} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-700">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-orange-600 font-medium">{product.quantity} units left</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(product.value)}</p>
                              <p className="text-xs text-gray-500">Value</p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">No low stock items</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quotations Report */}
        {selectedReport === 'quotations' && reportData && (
          <div className="space-y-6" data-report-tab="quotations">
            {/* Enhanced Quotation Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Quotations</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <FileText className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.quotations.totalQuotations}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      {getTrendIcon(reportData.quotations.quotationsTrend)}
                      {reportData.quotations.quotationsTrend.reduce((a, b) => a + b, 0)} this period
                    </div>
                    <MiniLineChart 
                      data={reportData.quotations.quotationsTrend} 
                      color={getTrendColor(reportData.quotations.quotationsTrend)} 
                      width={60} 
                      height={20} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Quotes</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <Clock className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.quotations.pendingQuotations}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1 text-orange-500" />
                    Awaiting response
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Accepted Quotes</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <CheckCircle className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.quotations.quotationsByStatus.find(s => s.status === 'ACCEPTED')?.count || 0}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Customer approved
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <TrendingUp className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {reportData.quotations.conversionRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Quote to invoice
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Quote Value</CardTitle>
                  <div className={`p-2 bg-${theme.primaryBg} rounded-lg`}>
                    <DollarSign className={`h-4 w-4 text-${theme.primary}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.sales.monthlyRevenue / Math.max(reportData.quotations.totalQuotations, 1))}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <FileText className="h-3 w-3 mr-1 text-purple-500" />
                    Per quotation
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quotation Trend Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Quotation Trend
                  </CardTitle>
                  <CardDescription>Quotations created over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsAreaChart data={reportData.quotations.quotationsTrend.map((count, index) => ({
                      day: `Day ${index + 1}`,
                      quotations: count
                    }))}>
                      <defs>
                        <linearGradient id="quotationsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Quotations']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="quotations" 
                        stroke={themeColor} 
                        strokeWidth={2}
                        fill="url(#quotationsGradient)"
                      />
                    </RechartsAreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution Chart */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Status Distribution
                  </CardTitle>
                  <CardDescription>Quotations by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart 
                      data={reportData.quotations.quotationsByStatus}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="status" 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [value, 'Count']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={themeColor}
                        radius={[8, 8, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown Detail */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Quotation Status Details
                </CardTitle>
                <CardDescription>Detailed breakdown by status with percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.quotations.quotationsByStatus.map((status) => {
                    const percentage = (status.count / reportData.quotations.totalQuotations) * 100;
                    const statusColors = {
                      'DRAFT': { bg: 'bg-gray-500', text: 'text-gray-700' },
                      'SENT': { bg: 'bg-blue-500', text: 'text-blue-700' },
                      'ACCEPTED': { bg: 'bg-green-500', text: 'text-green-700' },
                      'REJECTED': { bg: 'bg-red-500', text: 'text-red-700' },
                      'EXPIRED': { bg: 'bg-orange-500', text: 'text-orange-700' }
                    };
                    const colors = statusColors[status.status as keyof typeof statusColors] || { bg: 'bg-gray-500', text: 'text-gray-700' };
                    
                    return (
                      <div key={status.status} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-4 h-4 rounded-full ${colors.bg}`}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{status.status}</span>
                              <span className={`text-sm font-medium ${colors.text}`}>
                                {status.count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${colors.bg}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Agents Report */}
        {selectedReport === 'agents' && reportData && reportData.agents && (
          <div className="space-y-6" data-report-tab="agents">
            {/* Enhanced Agents Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.agents.totalAgents}</div>
                  <p className="text-xs text-muted-foreground">
                    {reportData.agents.activeAgents} active
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">GH₵{reportData.agents.totalCommissions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All time commissions
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">GH₵{reportData.agents.pendingCommissions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting payment
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid Commissions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">GH₵{reportData.agents.paidCommissions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully paid
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.agents.totalAgents > 0 
                      ? Math.round((reportData.agents.activeAgents / reportData.agents.totalAgents) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Agents active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commissions by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Commissions by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={reportData.agents.commissionsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {reportData.agents.commissionsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.agents.topPerformers.map((agent, index) => (
                      <div key={agent.agentCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.agentCode} • {agent.territory}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">GH₵{agent.totalCommissions.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{agent.commissionCount} commissions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commissions Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Commissions Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={reportData.agents.commissionsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`GH₵${value}`, 'Amount']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Export Reports</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Export Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setExportFormat('excel')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      exportFormat === 'excel'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Excel (.xlsx)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Data only, no charts</p>
                  </button>
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                      exportFormat === 'pdf'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-5 w-5 text-red-600" />
                      <span className="font-medium">PDF</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Data & chart images</p>
                  </button>
                </div>
              </div>

              {/* Tab Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Reports to Export</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'sales', label: 'Sales' },
                    { id: 'customers', label: 'Customers' },
                    { id: 'crm', label: 'CRM' },
                    { id: 'drm', label: 'DRM' },
                    { id: 'inventory', label: 'Inventory' },
                    { id: 'quotations', label: 'Quotations' },
                    { id: 'agents', label: 'Agents' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => toggleTab(tab.id)}
                      className={`py-2 px-4 rounded-lg border-2 text-left transition-colors ${
                        selectedTabs.includes(tab.id)
                          ? `border-${theme.primary} bg-${theme.primaryBg}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTabs.includes(tab.id)}
                          onChange={() => toggleTab(tab.id)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Indicator */}
              {isExporting && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Exporting reports...</p>
                      <p className="text-xs text-blue-700">This may take a moment for PDF exports with charts</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={() => setShowExportModal(false)}
                  variant="outline"
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={selectedTabs.length === 0 || isExporting}
                  style={{ backgroundColor: themeColor, color: 'white' }}
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {selectedTabs.length} {selectedTabs.length === 1 ? 'Report' : 'Reports'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
