import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIService, BUSINESS_ANALYST_PROMPT } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

// Page-specific prompts for different business contexts
const PAGE_PROMPTS = {
  'crm-dashboard': `You are analyzing CRM data. Focus on lead conversion, opportunity pipeline, and customer engagement insights. Provide 3 actionable recommendations for improving CRM performance.`,
  
  'opportunities': `You are analyzing the sales pipeline and opportunities. Focus on deal progression, win rates, and pipeline optimization. Provide 3 actionable recommendations for improving sales performance.`,
  
  'leads': `You are analyzing lead data and conversion patterns. Focus on lead quality, follow-up strategies, and conversion optimization. Provide 3 actionable recommendations for improving lead management.`,
  
  'products': `You are analyzing product and inventory data. Focus on stock levels, product performance, and inventory optimization. Provide 3 actionable recommendations for improving product management.`,
  
  'inventory': `You are analyzing inventory and stock data. Focus on stock levels, movement patterns, and warehouse optimization. Provide 3 actionable recommendations for improving inventory management.`,
  
  'tasks': `You are analyzing task and productivity data. Focus on task completion rates, priorities, and workflow optimization. Provide 3 actionable recommendations for improving task management.`,
  
  'distributors': `You are analyzing distributor network and performance data. Focus on distributor engagement, sales performance, and network optimization. Provide 3 actionable recommendations for improving distributor management.`,
  
  'warehouses': `You are analyzing warehouse operations and inventory data. Focus on warehouse efficiency, stock distribution, and operational optimization. Provide 3 actionable recommendations for improving warehouse management.`,
  
  'reports': `You are analyzing comprehensive business reports and metrics. Focus on overall business performance, trends, and strategic insights. Provide 3 actionable recommendations for improving business performance.`
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { page, context } = body;

    if (!page) {
      return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 });
    }

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
            'ai_max_tokens',
            'ai_enable_recommendations'
          ]
        }
      }
    });

    // Check if AI is enabled
    const enabledSetting = aiSettings.find(s => s.key === 'ai_enabled');
    const recommendationsEnabled = aiSettings.find(s => s.key === 'ai_enable_recommendations');
    
    if (enabledSetting?.value !== 'true' || recommendationsEnabled?.value !== 'true') {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'AI recommendations are disabled'
      });
    }

    // Build AI settings object
    const settingsObj: any = {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000
    };

    aiSettings.forEach(setting => {
      switch (setting.key) {
        case 'ai_provider':
          settingsObj.provider = setting.value;
          break;
        case 'ai_openai_api_key':
          settingsObj.openaiApiKey = setting.value;
          break;
        case 'ai_anthropic_api_key':
          settingsObj.anthropicApiKey = setting.value;
          break;
        case 'ai_gemini_api_key':
          settingsObj.geminiApiKey = setting.value;
          break;
        case 'ai_model':
          settingsObj.model = setting.value;
          break;
        case 'ai_temperature':
          settingsObj.temperature = parseFloat(setting.value);
          break;
        case 'ai_max_tokens':
          settingsObj.maxTokens = parseInt(setting.value);
          break;
      }
    });

    // Check if API key is configured
    const apiKeyField = settingsObj.provider === 'openai' ? 'openaiApiKey' : 
                       settingsObj.provider === 'anthropic' ? 'anthropicApiKey' : 'geminiApiKey';
    
    if (!settingsObj[apiKeyField]) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'AI API key not configured'
      });
    }

    // Get business data based on page context
    const businessData = await getBusinessDataForPage(page, context);

    // Create AI service instance
    const aiService = new AIService(settingsObj);

    // Get page-specific prompt
    const pagePrompt = PAGE_PROMPTS[page as keyof typeof PAGE_PROMPTS] || PAGE_PROMPTS['crm-dashboard'];

    // Generate recommendations
    const aiResponse = await aiService.generateResponse(
      `Based on the current business data, provide 3 specific, actionable recommendations for this ${page} page. Each recommendation should include:
      1. A clear title (max 5 words)
      2. A detailed description (max 50 words)
      3. A priority level (high, medium, or low)
      4. A suggested action (max 10 words)
      
      Format your response as a JSON array with this structure:
      [
        {
          "title": "Recommendation Title",
          "description": "Detailed description of the recommendation",
          "priority": "high|medium|low",
          "action": "Suggested action to take"
        }
      ]`,
      businessData,
      [],
      pagePrompt
    );

    // Parse AI response
    let recommendations = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create recommendations from text
        recommendations = createFallbackRecommendations(aiResponse.text);
      }
    } catch (error) {
      console.error('Error parsing AI recommendations:', error);
      recommendations = createFallbackRecommendations(aiResponse.text);
    }

    // Ensure we have exactly 3 recommendations
    if (recommendations.length < 3) {
      recommendations = recommendations.concat(createDefaultRecommendations(page, 3 - recommendations.length));
    }

    // Add IDs and format for the component
    const formattedRecommendations = recommendations.slice(0, 3).map((rec: any, index: number) => ({
      id: `${page}-${index + 1}`,
      title: rec.title || `Recommendation ${index + 1}`,
      description: rec.description || 'AI-generated recommendation',
      priority: rec.priority || 'medium',
      action: rec.action || 'Take action',
      completed: false
    }));

    return NextResponse.json({
      success: true,
      recommendations: formattedRecommendations
    });

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return NextResponse.json({
      success: true,
      recommendations: [],
      message: 'Failed to generate AI recommendations'
    });
  }
}

async function getBusinessDataForPage(page: string, context?: any) {
  try {
    switch (page) {
      case 'crm-dashboard':
        return await getCRMDashboardData();
      case 'opportunities':
        return await getOpportunitiesData();
      case 'leads':
        return await getLeadsData();
      case 'products':
        return await getProductsData();
      case 'inventory':
        return await getInventoryData();
      case 'tasks':
        return await getTasksData();
      case 'distributors':
        return await getDistributorsData();
      case 'warehouses':
        return await getWarehousesData();
      case 'reports':
        return await getReportsData();
      default:
        return await getCRMDashboardData();
    }
  } catch (error) {
    console.error('Error fetching business data:', error);
    return {};
  }
}

async function getCRMDashboardData() {
  const [leads, opportunities, accounts] = await Promise.all([
    prisma.lead.count(),
    prisma.opportunity.count(),
    prisma.account.count()
  ]);

  return { leads, opportunities, accounts };
}

async function getOpportunitiesData() {
  const [total, won, lost, pipeline] = await Promise.all([
    prisma.opportunity.count(),
    prisma.opportunity.count({ where: { stage: 'WON' } }),
    prisma.opportunity.count({ where: { stage: 'LOST' } }),
    prisma.opportunity.aggregate({
      _sum: { value: true },
      where: { stage: { not: 'WON' } }
    })
  ]);

  return { total, won, lost, pipelineValue: pipeline._sum.value || 0 };
}

async function getLeadsData() {
  const [total, newLeads, contacted, qualified] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'CONTACTED' } }),
    prisma.lead.count({ where: { status: 'QUALIFIED' } })
  ]);

  return { total, newLeads, contacted, qualified };
}

async function getProductsData() {
  const [total, lowStock, outOfStock] = await Promise.all([
    prisma.product.count(),
    prisma.stockItem.count({ where: { quantity: { lte: 10 } } }),
    prisma.stockItem.count({ where: { quantity: 0 } })
  ]);

  return { total, lowStock, outOfStock };
}

async function getInventoryData() {
  const [totalItems, lowStock, totalValue] = await Promise.all([
    prisma.stockItem.count(),
    prisma.stockItem.count({ where: { quantity: { lte: 10 } } }),
    prisma.stockItem.aggregate({
      _sum: { quantity: true }
    })
  ]);

  return { totalItems, lowStock, totalValue: totalValue._sum.quantity || 0 };
}

async function getTasksData() {
  const [total, completed, overdue, pending] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({ 
      where: { 
        status: { not: 'COMPLETED' },
        dueDate: { lt: new Date() }
      }
    }),
    prisma.task.count({ where: { status: 'PENDING' } })
  ]);

  return { total, completed, overdue, pending };
}

async function getDistributorsData() {
  const [total, active, inactive] = await Promise.all([
    prisma.distributor.count(),
    prisma.distributor.count({ where: { status: 'ACTIVE' } }),
    prisma.distributor.count({ where: { status: 'INACTIVE' } })
  ]);

  return { total, active, inactive };
}

async function getWarehousesData() {
  const [total, totalStock, totalValue] = await Promise.all([
    prisma.warehouse.count(),
    prisma.stockItem.aggregate({
      _sum: { quantity: true }
    }),
    prisma.stockItem.aggregate({
      _sum: { averageCost: true }
    })
  ]);

  return { 
    total, 
    totalStock: totalStock._sum.quantity || 0,
    totalValue: totalValue._sum.averageCost || 0
  };
}

async function getReportsData() {
  const [invoices, payments, orders] = await Promise.all([
    prisma.invoice.count(),
    prisma.payment.count(),
    prisma.order.count()
  ]);

  return { invoices, payments, orders };
}

function createFallbackRecommendations(aiText: string) {
  // Extract recommendations from AI text if JSON parsing failed
  const lines = aiText.split('\n').filter(line => line.trim());
  const recommendations = [];
  
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (line) {
      recommendations.push({
        title: `AI Insight ${i + 1}`,
        description: line.substring(0, 100),
        priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
        action: 'Review and implement'
      });
    }
  }
  
  return recommendations;
}

function createDefaultRecommendations(page: string, count: number) {
  const defaultRecs = {
    'crm-dashboard': [
      { title: 'Follow up leads', description: 'Contact new leads within 24 hours', priority: 'high', action: 'Call leads' },
      { title: 'Update opportunities', description: 'Review and update opportunity stages', priority: 'medium', action: 'Update pipeline' },
      { title: 'Analyze conversion', description: 'Review lead to opportunity conversion rates', priority: 'low', action: 'Generate report' }
    ],
    'opportunities': [
      { title: 'Close deals', description: 'Focus on high-value opportunities', priority: 'high', action: 'Schedule calls' },
      { title: 'Update pipeline', description: 'Review opportunity stages and probabilities', priority: 'medium', action: 'Update stages' },
      { title: 'Follow up', description: 'Contact prospects with pending quotes', priority: 'low', action: 'Send emails' }
    ],
    'products': [
      { title: 'Restock items', description: 'Order low-stock products', priority: 'high', action: 'Create purchase orders' },
      { title: 'Update pricing', description: 'Review and adjust product pricing', priority: 'medium', action: 'Update prices' },
      { title: 'Add products', description: 'Expand product catalog', priority: 'low', action: 'Add new items' }
    ]
  };

  const pageRecs = defaultRecs[page as keyof typeof defaultRecs] || defaultRecs['crm-dashboard'];
  return pageRecs.slice(0, count);
}
