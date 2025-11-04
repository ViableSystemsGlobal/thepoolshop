import { prisma } from '@/lib/prisma';
import { AIService } from '@/lib/ai-service';
import { getCompanyName, sendEmailViaSMTP } from '@/lib/payment-order-notifications';
import { getSettingValue } from '@/lib/utils';

// Helper function to get setting value from database
async function getSettingValueLocal(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
      select: { value: true }
    });
    return setting?.value || defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

// Fetch comprehensive business data with date range based on frequency
async function fetchComprehensiveBusinessData(userId: string, frequency: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const now = new Date();
  let startDate: Date;
  let periodDescription: string;

  if (frequency === 'daily') {
    // Daily: Yesterday to today
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    startDate = yesterday;
    periodDescription = 'Yesterday and Today';
  } else if (frequency === 'weekly') {
    // Weekly: Last 7 days
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    startDate = lastWeek;
    periodDescription = 'Last 7 Days';
  } else {
    // Monthly: Last 30 days
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    startDate = lastMonth;
    periodDescription = 'Last 30 Days';
  }

  const [
    invoices,
    quotations,
    leads,
    opportunities,
    products,
    orders,
    returns,
    accounts,
    payments
  ] = await Promise.all([
    // Invoices
    prisma.invoice.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        number: true,
        total: true,
        amountPaid: true,
        amountDue: true,
        paymentStatus: true,
        dueDate: true,
        createdAt: true,
        account: {
          select: {
            name: true
          }
        }
      }
    }),
    // Quotations
    prisma.quotation.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        number: true,
        total: true,
        status: true,
        createdAt: true,
        account: {
          select: {
            name: true
          }
        }
      }
    }),
    // Leads
    prisma.lead.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        status: true,
        source: true,
        dealValue: true,
        createdAt: true
      }
    }),
    // Opportunities (filtered by owner)
    prisma.opportunity.findMany({
      where: {
        ownerId: userId
      },
      select: {
        id: true,
        name: true,
        value: true,
        stage: true,
        probability: true,
        createdAt: true,
        closeDate: true
      }
    }),
    // Products
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        active: true,
        _count: {
          select: {
            orderItems: true,
            invoiceLines: true
          }
        },
        stockItems: {
          select: {
            quantity: true,
            reorderPoint: true
          }
        }
      }
    }),
    // Orders
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    }),
    // Returns
    prisma.return.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        number: true,
        total: true,
        reason: true,
        status: true,
        createdAt: true
      }
    }),
    // Accounts
    prisma.account.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        email: true,
        phone: true,
        _count: {
          select: {
            invoices: true,
            quotations: true,
            payments: true
          }
        }
      }
    }),
    // Payments
    prisma.payment.findMany({
      where: { receivedAt: { gte: startDate } },
      select: {
        id: true,
        amount: true,
        method: true,
        receivedAt: true
      }
    })
  ]);

  // Helper function
  function groupBy(array: any[], field: string): { [key: string]: number } {
    return array.reduce((acc, item) => {
      const key = item[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  // Calculate comprehensive metrics
  const metrics = {
    period: periodDescription,
    sales: {
      totalRevenue: invoices.reduce((sum, i) => sum + i.amountPaid, 0),
      totalOutstanding: invoices.reduce((sum, i) => sum + i.amountDue, 0),
      invoiceCount: invoices.length,
      paidInvoices: invoices.filter(i => i.paymentStatus === 'PAID').length,
      unpaidInvoices: invoices.filter(i => i.paymentStatus === 'UNPAID').length,
      partiallyPaidInvoices: invoices.filter(i => i.paymentStatus === 'PARTIALLY_PAID').length,
      averageInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, i) => sum + i.total, 0) / invoices.length : 0,
      unpaidInvoiceDetails: invoices
        .filter(i => i.paymentStatus === 'UNPAID' || i.paymentStatus === 'PARTIALLY_PAID')
        .map(i => ({
          number: i.number,
          customer: i.account?.name || 'Unknown',
          amountDue: i.amountDue,
          dueDate: i.dueDate,
          status: i.paymentStatus
        }))
    },
    quotations: {
      total: quotations.length,
      totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
      accepted: quotations.filter(q => q.status === 'ACCEPTED').length,
      sent: quotations.filter(q => q.status === 'SENT').length,
      draft: quotations.filter(q => q.status === 'DRAFT').length,
      rejected: quotations.filter(q => q.status === 'REJECTED').length,
      conversionRate: quotations.length > 0 ? (quotations.filter(q => q.status === 'ACCEPTED').length / quotations.length * 100) : 0
    },
    leads: {
      total: leads.length,
      new: leads.filter(l => l.status === 'NEW').length,
      qualified: leads.filter(l => l.status === 'QUALIFIED').length,
      contacted: leads.filter(l => l.status === 'CONTACTED').length,
      totalValue: leads.reduce((sum, l) => sum + (l.dealValue || 0), 0),
      sources: groupBy(leads, 'source'),
      leadsList: leads.slice(0, 10).map(l => ({
        name: `${l.firstName} ${l.lastName}`,
        company: l.company,
        status: l.status,
        source: l.source,
        dealValue: l.dealValue
      }))
    },
    opportunities: {
      total: opportunities.length,
      totalValue: opportunities.reduce((sum, o) => sum + (o.value || 0), 0),
      weightedValue: opportunities.reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0),
      won: opportunities.filter(o => o.stage === 'WON').length,
      lost: opportunities.filter(o => o.stage === 'LOST').length,
      active: opportunities.filter(o => !['WON', 'LOST'].includes(o.stage)).length,
      winRate: opportunities.length > 0 ? (opportunities.filter(o => o.stage === 'WON').length / opportunities.length * 100) : 0,
      opportunitiesList: opportunities.slice(0, 10).map(o => ({
        name: o.name,
        value: o.value,
        stage: o.stage,
        probability: o.probability
      }))
    },
    products: {
      total: products.length,
      active: products.filter(p => p.active).length,
      lowStockProducts: products.filter(p => {
        const totalQty = p.stockItems.reduce((sum, si) => sum + si.quantity, 0);
        const minReorder = p.stockItems.length > 0 ? Math.min(...p.stockItems.map(si => si.reorderPoint || 0)) : 0;
        return totalQty <= minReorder && totalQty > 0;
      }).map(p => ({
        name: p.name,
        sku: p.sku,
        quantity: p.stockItems.reduce((sum, si) => sum + si.quantity, 0),
        reorderPoint: p.stockItems.length > 0 ? Math.min(...p.stockItems.map(si => si.reorderPoint || 0)) : 0
      })),
      outOfStockProducts: products.filter(p => p.stockItems.reduce((sum, si) => sum + si.quantity, 0) === 0).map(p => ({
        name: p.name,
        sku: p.sku
      })),
      topSellers: products
        .sort((a, b) => (b._count.orderItems + b._count.invoiceLines) - (a._count.orderItems + a._count.invoiceLines))
        .slice(0, 10)
        .map(p => ({
          name: p.name,
          sku: p.sku,
          sales: p._count.orderItems + p._count.invoiceLines,
          stock: p.stockItems.reduce((sum, si) => sum + si.quantity, 0),
          price: p.price
        }))
    },
    orders: {
      total: orders.length,
      totalValue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      processing: orders.filter(o => o.status === 'PROCESSING').length,
      fulfillmentRate: orders.length > 0 ? (orders.filter(o => o.status === 'DELIVERED').length / orders.length * 100) : 0
    },
    returns: {
      total: returns.length,
      totalValue: returns.reduce((sum, r) => sum + r.total, 0),
      reasons: groupBy(returns, 'reason'),
      returnRate: orders.length > 0 ? (returns.length / orders.length * 100) : 0,
      returnsList: returns.slice(0, 10).map(r => ({
        number: r.number,
        reason: r.reason,
        amount: r.total,
        status: r.status
      }))
    },
    customers: {
      total: accounts.length,
      topCustomers: accounts
        .sort((a, b) => (b._count.invoices + b._count.quotations) - (a._count.invoices + a._count.quotations))
        .slice(0, 10).map(a => ({
          name: a.name,
          email: a.email,
          phone: a.phone,
          invoices: a._count.invoices,
          quotes: a._count.quotations,
          payments: a._count.payments,
          totalActivity: a._count.invoices + a._count.quotations + a._count.payments
        }))
    },
    payments: {
      total: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      byMethod: groupBy(payments, 'method')
    }
  };

  return metrics;
}

// Main function to generate and send business report
export async function generateBusinessReport(userId: string): Promise<{ success: boolean; message?: string; error?: string; recipients?: any }> {
  try {
    console.log('📊 Business Report Generator: Starting for user', userId);

    // Get report settings
    const reportSettings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'ai_business_report_enabled',
            'ai_business_report_frequency',
            'ai_business_report_recipients',
            'ai_business_report_time',
            'ai_business_report_day',
            'ai_business_report_timezone'
          ]
        }
      }
    });

    const reportSettingsMap = reportSettings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Get AI settings
    const aiSettings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'ai_enabled',
            'ai_provider',
            'ai_openai_api_key',
            'ai_anthropic_api_key',
            'ai_gemini_api_key',
            'ai_model',
            'ai_temperature',
            'ai_max_tokens'
          ]
        }
      }
    });

    const aiSettingsMap = aiSettings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Check if AI is enabled
    if (aiSettingsMap.ai_enabled === 'false') {
      return {
        success: false,
        error: 'AI is disabled. Please enable it in Settings > AI Settings.'
      };
    }

    const provider = aiSettingsMap.ai_provider || 'openai';
    const apiKey = aiSettingsMap[`ai_${provider}_api_key`];
    
    if (!apiKey) {
      return {
        success: false,
        error: `No API key configured for ${provider}. Please add your ${provider} API key in Settings > AI Settings.`
      };
    }

    // Get company name
    const companyName = await getCompanyName() || 'AdPools Group';
    
    // Get base currency from settings
    const baseCurrency = await getSettingValueLocal('base_currency', 'GHS');
    const currencySymbol = baseCurrency === 'GHS' ? 'GH₵' : '$';
    
    // Get frequency for date range
    const frequency = (reportSettingsMap.ai_business_report_frequency || 'daily') as 'daily' | 'weekly' | 'monthly';
    
    // Determine report type
    const reportType = frequency === 'weekly' ? 'Weekly' : frequency === 'monthly' ? 'Monthly' : 'Daily';
    
    // Fetch comprehensive business data with appropriate date range
    const businessData = await fetchComprehensiveBusinessData(userId, frequency);
    
    // Format currency values in business data for better AI understanding
    const formattedBusinessData = {
      ...businessData,
      sales: {
        ...businessData.sales,
        totalRevenue: `${currencySymbol}${businessData.sales.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalOutstanding: `${currencySymbol}${businessData.sales.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        averageInvoiceValue: `${currencySymbol}${businessData.sales.averageInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unpaidInvoiceDetails: businessData.sales.unpaidInvoiceDetails.map(inv => ({
          ...inv,
          amountDue: `${currencySymbol}${inv.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }))
      },
      quotations: {
        ...businessData.quotations,
        totalValue: `${currencySymbol}${businessData.quotations.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      leads: {
        ...businessData.leads,
        totalValue: `${currencySymbol}${businessData.leads.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        leadsList: businessData.leads.leadsList.map(lead => ({
          ...lead,
          dealValue: lead.dealValue ? `${currencySymbol}${lead.dealValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null
        }))
      },
      opportunities: {
        ...businessData.opportunities,
        totalValue: `${currencySymbol}${businessData.opportunities.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        weightedValue: `${currencySymbol}${businessData.opportunities.weightedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        opportunitiesList: businessData.opportunities.opportunitiesList.map(opp => ({
          ...opp,
          value: opp.value ? `${currencySymbol}${opp.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null
        }))
      },
      orders: {
        ...businessData.orders,
        totalValue: `${currencySymbol}${businessData.orders.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      returns: {
        ...businessData.returns,
        totalValue: `${currencySymbol}${businessData.returns.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        returnsList: businessData.returns.returnsList.map(ret => ({
          ...ret,
          amount: `${currencySymbol}${ret.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }))
      },
      payments: {
        ...businessData.payments,
        totalAmount: `${currencySymbol}${businessData.payments.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        averagePayment: `${currencySymbol}${businessData.payments.averagePayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    };

    // Create enhanced prompt for business report
    const periodContext = frequency === 'daily' 
      ? 'yesterday and today' 
      : frequency === 'weekly' 
      ? 'the last 7 days (weekly period)' 
      : 'the last 30 days (monthly period)';
    
    const reportPrompt = `You are Jayne, the AI Business Analyst for ${companyName}. 

Generate a comprehensive ${reportType.toLowerCase()} business report analyzing the current state of the business for ${periodContext}. The report should:

1. Start with a brief executive summary highlighting key achievements and concerns
2. Analyze key business metrics including:
   - Sales performance (revenue, outstanding invoices, payment trends)
   - Quotation performance (conversion rates, acceptance rates)
   - Lead generation and pipeline health
   - Opportunity pipeline and win rates
   - Product performance and inventory status
   - Order fulfillment metrics
   - Customer relationships

3. Provide actionable insights and recommendations based on the data

4. **CRITICAL: At the end of the report, you MUST include exactly THREE "Next Best Actions"** - these should be specific, actionable recommendations that the business owner should prioritize. Format them exactly as follows:
   
   **Next Best Actions:**
   1. [Specific action with context and why it matters]
   2. [Specific action with context and why it matters]
   3. [Specific action with context and why it matters]

**CRITICAL CURRENCY INSTRUCTIONS:**
- All monetary amounts in this report MUST use ${currencySymbol} (${baseCurrency === 'GHS' ? 'Ghana Cedis' : baseCurrency}), NOT dollars ($).
- When referencing any financial figures, always use ${currencySymbol} symbol, NOT $.
- The base currency for this business is ${baseCurrency} (${currencySymbol}).
- Example: Write "${currencySymbol}400,911.24" NOT "$400,911.24".
- Example: Write "${currencySymbol}747,645.07" NOT "$747,645.07".

IMPORTANT: Always end your report with the "Next Best Actions" section. These should be the most important actions the business owner should take based on the current data analysis.

Use the following business data to inform your analysis:

${JSON.stringify(formattedBusinessData, null, 2)}

Generate a professional, concise report that would be valuable for daily/weekly business review. Always conclude with exactly three next best actions. Use ${currencySymbol} for all monetary amounts, NOT dollars.`;

    // Initialize AI service
    const aiService = new AIService({
      provider,
      openaiApiKey: aiSettingsMap.ai_openai_api_key,
      anthropicApiKey: aiSettingsMap.ai_anthropic_api_key,
      geminiApiKey: aiSettingsMap.ai_gemini_api_key,
      model: aiSettingsMap.ai_model || 'gpt-4',
      temperature: parseFloat(aiSettingsMap.ai_temperature || '0.7'),
      maxTokens: parseInt(aiSettingsMap.ai_max_tokens || '2000')
    });

    const aiResponse = await aiService.generateResponse(
      'Generate a comprehensive business report with three next best actions at the end.',
      businessData,
      [],
      reportPrompt
    );

    // Get recipients from settings
    let recipients: string[] = [];
    
    if (reportSettingsMap.ai_business_report_recipients && reportSettingsMap.ai_business_report_recipients.trim()) {
      recipients = reportSettingsMap.ai_business_report_recipients
        .split(',')
        .map((email: string) => email.trim())
        .filter(Boolean);
    }
    
    if (recipients.length === 0) {
      return {
        success: false,
        error: 'No recipients configured. Please add recipient email addresses in Settings.'
      };
    }

    // Check if email is enabled
    const emailEnabled = await getSettingValueLocal('EMAIL_ENABLED', 'false');
    if (emailEnabled !== 'true') {
      return {
        success: false,
        error: 'Email notifications are not enabled. Please enable email in Settings > Notifications.'
      };
    }

    // Get timezone from settings
    const timezone = reportSettingsMap.ai_business_report_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Format date according to timezone
    const reportDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: timezone
    });

    // Format email content
    const emailSubject = `${reportType} Business Report - ${reportDate} | ${companyName}`;
    
    // Ensure the report includes three next best actions
    let reportContent = aiResponse.text;
    
    // Check if "Next Best Actions" section exists, if not add a note
    if (!reportContent.includes('Next Best Actions') && !reportContent.includes('next best action')) {
      reportContent += `\n\n**Next Best Actions:**\n\nBased on the analysis above, here are the three most important actions to take:\n\n1. Review and follow up on overdue invoices to improve cash flow\n2. Follow up on pending quotations to convert them to sales\n3. Monitor inventory levels and reorder low stock items`;
    }
    
    const emailContent = `
Good morning!

Here is your ${reportType.toLowerCase()} business report from Jayne, your AI Business Analyst, for ${reportDate}.

---

${reportContent}

---

Best regards,
Jayne (AI Business Analyst)
${companyName}
    `.trim();

    // Send email to all recipients
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const emailResult = await sendEmailViaSMTP(recipient, emailSubject, emailContent);
        
        results.push({
          recipient: recipient,
          success: emailResult.success,
          error: emailResult.error,
          messageId: emailResult.messageId
        });
      } catch (error) {
        results.push({
          recipient: recipient,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          messageId: null
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: successful > 0,
      message: `Business report sent to ${successful}/${recipients.length} recipient(s)`,
      recipients: {
        total: recipients.length,
        successful,
        failed
      }
    };

  } catch (error) {
    console.error('❌ Business Report Generator Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

