import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AIService, KWAME_PROMPT } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Kwame API: Request received');
    
    const body = await request.json();
    const { message, conversationHistory = [] } = body;
    
    console.log('📝 Kwame API: Message:', message);

    // Get AI settings from database
    const aiSettings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
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

    // Convert to map for easy access
    const settingsMap = aiSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const provider = settingsMap.ai_provider || 'openai';
    const apiKey = settingsMap[`ai_${provider}_api_key`];
    
    if (!apiKey) {
      return NextResponse.json(
        { error: `${provider} API key not configured. Please add it in AI Settings.` },
        { status: 500 }
      );
    }

    // Initialize AI service with selected provider
    console.log(`💬 Kwame API: Calling ${provider}...`);
    const aiService = new AIService({
      provider,
      openaiApiKey: settingsMap.ai_openai_api_key,
      anthropicApiKey: settingsMap.ai_anthropic_api_key,
      geminiApiKey: settingsMap.ai_gemini_api_key,
      model: settingsMap.ai_model || 'gpt-4',
      temperature: parseFloat(settingsMap.ai_temperature || '0.7'),
      maxTokens: parseInt(settingsMap.ai_max_tokens || '1000')
    });

    const aiResponse = await aiService.generateResponse(
      message,
      {}, // Kwame doesn't need business data
      conversationHistory,
      KWAME_PROMPT
    );

    console.log('✅ Kwame API: Response generated');

    return NextResponse.json({
      response: {
        text: aiResponse.text,
        chart: aiResponse.chart
      }
    });

  } catch (error) {
    console.error('❌ Kwame API Error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to process your question. Please try again.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

