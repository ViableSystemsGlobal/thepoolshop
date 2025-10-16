import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get AI settings from system_settings table
    const settingKeys = [
      'ai_enabled',
      'ai_provider',
      'ai_openai_api_key',
      'ai_anthropic_api_key',
      'ai_gemini_api_key',
      'ai_model',
      'ai_temperature',
      'ai_max_tokens',
      'ai_conversation_history',
      'ai_enable_charts',
      'ai_enable_insights',
      'ai_enable_recommendations'
    ];

    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: settingKeys
        }
      }
    });

    // Convert to object
    const settingsObj: any = {
      enabled: true,
      provider: 'openai',
      openaiApiKey: '',
      anthropicApiKey: '',
      geminiApiKey: '',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      conversationHistory: 5,
      enableCharts: true,
      enableInsights: true,
      enableRecommendations: true
    };

    settings.forEach(setting => {
      switch (setting.key) {
        case 'ai_enabled':
          settingsObj.enabled = setting.value === 'true';
          break;
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
        case 'ai_conversation_history':
          settingsObj.conversationHistory = parseInt(setting.value);
          break;
        case 'ai_enable_charts':
          settingsObj.enableCharts = setting.value === 'true';
          break;
        case 'ai_enable_insights':
          settingsObj.enableInsights = setting.value === 'true';
          break;
        case 'ai_enable_recommendations':
          settingsObj.enableRecommendations = setting.value === 'true';
          break;
      }
    });

    return NextResponse.json({
      success: true,
      settings: settingsObj
    });

  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json({ error: 'Failed to fetch AI settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Save each setting
    const settingsToSave = [
      { key: 'ai_enabled', value: body.enabled.toString() },
      { key: 'ai_provider', value: body.provider },
      { key: 'ai_openai_api_key', value: body.openaiApiKey || '' },
      { key: 'ai_anthropic_api_key', value: body.anthropicApiKey || '' },
      { key: 'ai_gemini_api_key', value: body.geminiApiKey || '' },
      { key: 'ai_model', value: body.model },
      { key: 'ai_temperature', value: body.temperature.toString() },
      { key: 'ai_max_tokens', value: body.maxTokens.toString() },
      { key: 'ai_conversation_history', value: body.conversationHistory.toString() },
      { key: 'ai_enable_charts', value: body.enableCharts.toString() },
      { key: 'ai_enable_insights', value: body.enableInsights.toString() },
      { key: 'ai_enable_recommendations', value: body.enableRecommendations.toString() }
    ];

    for (const setting of settingsToSave) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: 'ai'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'AI settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json({ error: 'Failed to save AI settings' }, { status: 500 });
  }
}

