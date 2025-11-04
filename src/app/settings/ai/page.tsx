"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Save,
  Loader2,
  Sparkles,
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  RefreshCw,
  Mail,
  Send,
  Clock,
  Plus,
  X,
  User
} from "lucide-react";

interface AISettings {
  enabled: boolean;
  provider: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  conversationHistory: number;
  enableCharts: boolean;
  enableInsights: boolean;
  enableRecommendations: boolean;
  businessReportEnabled: boolean;
  businessReportFrequency: 'daily' | 'weekly' | 'monthly';
  businessReportRecipients: string;
  businessReportTime: string;
  businessReportDay: string;
  businessReportTimezone: string;
}

export default function AISettingsPage() {
  const { success, error } = useToast();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AISettings>({
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
    enableRecommendations: true,
    businessReportEnabled: false,
    businessReportFrequency: 'daily',
    businessReportRecipients: '',
    businessReportTime: '08:00',
    businessReportDay: 'monday',
    businessReportTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [sendingReport, setSendingReport] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [recipientsList, setRecipientsList] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Parse recipients string to array when settings load
    if (settings.businessReportRecipients) {
      const emails = settings.businessReportRecipients
        .split(',')
        .map(email => email.trim())
        .filter(Boolean);
      setRecipientsList(emails);
    } else {
      setRecipientsList([]);
    }
  }, [settings.businessReportRecipients]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users/public', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const addRecipient = (email: string) => {
    if (email && !recipientsList.includes(email)) {
      const newRecipients = [...recipientsList, email];
      setRecipientsList(newRecipients);
      setSettings({ ...settings, businessReportRecipients: newRecipients.join(', ') });
      setManualEmail('');
    }
  };

  const removeRecipient = (email: string) => {
    const newRecipients = recipientsList.filter(r => r !== email);
    setRecipientsList(newRecipients);
    setSettings({ ...settings, businessReportRecipients: newRecipients.join(', ') });
  };

  const addUserAsRecipient = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.email) {
      addRecipient(user.email);
    }
  };

  const addManualEmail = () => {
    if (manualEmail.trim()) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(manualEmail.trim())) {
        addRecipient(manualEmail.trim());
      } else {
        error('Please enter a valid email address');
      }
    }
  };

  // Get available models based on selected provider
  const getAvailableModels = (provider: string) => {
    switch (provider) {
      case 'openai':
        return [
          { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Faster)' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fastest)' }
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Balanced)' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fastest)' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Latest & Fastest)' },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Most Capable)' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Stable)' },
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Stable)' },
          { value: 'gemini-pro', label: 'Gemini Pro (Legacy)' }
        ];
      default:
        return [];
    }
  };

  // Get API key field name based on provider
  const getApiKeyField = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'openaiApiKey';
      case 'anthropic':
        return 'anthropicApiKey';
      case 'gemini':
        return 'geminiApiKey';
      default:
        return 'openaiApiKey';
    }
  };

  // Handle provider change
  const handleProviderChange = (newProvider: string) => {
    const availableModels = getAvailableModels(newProvider);
    const defaultModel = availableModels[0]?.value || '';
    
    setSettings({
      ...settings,
      provider: newProvider,
      model: defaultModel
    });
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/ai', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Error fetching AI settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to save settings');
      }

      success('AI settings saved successfully');
    } catch (err) {
      console.error('Error saving AI settings:', err);
      error(err instanceof Error ? err.message : 'Failed to save AI settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerReport = async () => {
    if (recipientsList.length === 0) {
      error('Please add at least one recipient email address before triggering the report');
      return;
    }

    setSendingReport(true);
    console.log('📧 Triggering business report...');
    console.log('📧 Recipients:', settings.businessReportRecipients);
    
    try {
      // First save the current settings (including recipients) so the API uses them
      const saveResponse = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      // Then trigger the report
      const response = await fetch('/api/ai/business-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      console.log('📧 Response status:', response.status);
      const result = await response.json();
      console.log('📧 Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send business report');
      }

      if (result.success) {
        success(`Business report sent successfully to ${result.recipients?.successful || 0} recipient(s)!`);
      } else {
        error(result.error || 'Failed to send business report');
      }
    } catch (err) {
      console.error('❌ Error triggering business report:', err);
      error(err instanceof Error ? err.message : 'Failed to send business report');
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-blue-600" />
              AI Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure your AI Business Analyst</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center"
            style={{
              backgroundColor: theme.primary.includes('purple') ? '#9333ea' :
                             theme.primary.includes('blue') ? '#2563eb' :
                             theme.primary.includes('green') ? '#16a34a' :
                             theme.primary.includes('orange') ? '#ea580c' :
                             theme.primary.includes('red') ? '#dc2626' : '#2563eb',
              color: 'white'
            }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Enable AI Business Analyst</label>
                <p className="text-sm text-gray-600">Turn on/off the AI chatbot feature</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* AI Provider Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              AI Provider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <select
                value={settings.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="openai">OpenAI (GPT Models)</option>
                <option value="anthropic">Anthropic (Claude Models)</option>
                <option value="gemini">Google (Gemini Models)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose your preferred AI provider
              </p>
            </div>

            {/* OpenAI API Key */}
            {settings.provider === 'openai' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
                </p>
              </div>
            )}

            {/* Anthropic API Key */}
            {settings.provider === 'anthropic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={settings.anthropicApiKey}
                  onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a>
                </p>
              </div>
            )}

            {/* Gemini API Key */}
            {settings.provider === 'gemini' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google AI API Key
                </label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="AI..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getAvailableModels(settings.provider).map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the model that best fits your needs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-orange-600" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (Creativity)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {settings.temperature.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lower = More focused, Higher = More creative
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens (Response Length)
              </label>
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                min="100"
                max="4000"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum length of AI responses (100-4000)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation History
              </label>
              <input
                type="number"
                value={settings.conversationHistory}
                onChange={(e) => setSettings({ ...settings, conversationHistory: parseInt(e.target.value) })}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of previous messages to include for context (1-20)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              Feature Toggles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Enable Charts</label>
                <p className="text-sm text-gray-600">Show visual charts in AI responses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableCharts}
                  onChange={(e) => setSettings({ ...settings, enableCharts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Enable Insights</label>
                <p className="text-sm text-gray-600">Provide actionable business insights</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableInsights}
                  onChange={(e) => setSettings({ ...settings, enableInsights: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Enable Recommendations</label>
                <p className="text-sm text-gray-600">AI-powered business recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableRecommendations}
                  onChange={(e) => setSettings({ ...settings, enableRecommendations: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Usage & Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Usage & Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Queries This Month</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-500 mt-1">of unlimited</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tokens Used</p>
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-500 mt-1">of unlimited</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                <p className="text-3xl font-bold text-purple-600">0s</p>
                <p className="text-xs text-gray-500 mt-1">last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Report Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Automated Business Reports</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Configure Jayne (AI Business Analyst) to send automated daily or weekly business reports via email
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Automated Reports</label>
                <p className="text-xs text-gray-500">Send automated business reports via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.businessReportEnabled}
                  onChange={(e) => setSettings({ ...settings, businessReportEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.businessReportEnabled && (
              <>
                {/* Frequency */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Frequency</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="frequency"
                        value="daily"
                        checked={settings.businessReportFrequency === 'daily'}
                        onChange={(e) => setSettings({ ...settings, businessReportFrequency: e.target.value as 'daily' | 'weekly' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Daily</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="frequency"
                        value="weekly"
                        checked={settings.businessReportFrequency === 'weekly'}
                        onChange={(e) => setSettings({ ...settings, businessReportFrequency: e.target.value as 'daily' | 'weekly' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Weekly</span>
                    </label>
                  </div>
                </div>

                {/* Time */}
                {(settings.businessReportFrequency === 'daily' || settings.businessReportFrequency === 'weekly') && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="reportTime" className="text-sm font-medium text-gray-700 mb-2 block">
                        Send Time
                      </label>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <input
                          id="reportTime"
                          type="time"
                          value={settings.businessReportTime}
                          onChange={(e) => setSettings({ ...settings, businessReportTime: e.target.value })}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="reportTimezone" className="text-sm font-medium text-gray-700 mb-2 block">
                        Timezone
                      </label>
                      <select
                        id="reportTimezone"
                        value={settings.businessReportTimezone}
                        onChange={(e) => setSettings({ ...settings, businessReportTimezone: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                      >
                        {Intl.supportedValuesOf('timeZone').map((tz) => (
                          <option key={tz} value={tz}>
                            {tz.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Time will be sent according to this timezone</p>
                    </div>
                  </div>
                )}

                {/* Day of Week */}
                {settings.businessReportFrequency === 'weekly' && (
                  <div>
                    <label htmlFor="reportDay" className="text-sm font-medium text-gray-700 mb-2 block">
                      Day of Week
                    </label>
                    <select
                      id="reportDay"
                      value={settings.businessReportDay}
                      onChange={(e) => setSettings({ ...settings, businessReportDay: e.target.value })}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                )}

                {/* Recipients */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Recipient Email Addresses
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Add users from your system or external email addresses</p>
                  
                  {/* Selected Recipients List */}
                  {recipientsList.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {recipientsList.map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                        >
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{email}</span>
                            {users.some(u => u.email === email) && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">User</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRecipient(email)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add User from System */}
                  <div className="mb-2">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          addUserAsRecipient(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                      disabled={loadingUsers}
                    >
                      <option value="">Select a user from your system...</option>
                      {users
                        .filter(user => user.email && !recipientsList.includes(user.email))
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Add External Email */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addManualEmail();
                        }
                      }}
                      placeholder="Enter external email address..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={addManualEmail}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Manual Trigger Button */}
                <div className="pt-4 border-t">
                  <button
                    onClick={handleTriggerReport}
                    disabled={sendingReport || recipientsList.length === 0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-white hover:opacity-90 transition-opacity border-0 shadow-sm hover:shadow-md gap-2"
                    style={{ 
                      backgroundColor: theme.primary.includes('purple') ? '#9333ea' :
                                       theme.primary.includes('blue') ? '#2563eb' :
                                       theme.primary.includes('green') ? '#16a34a' :
                                       theme.primary.includes('orange') ? '#ea580c' :
                                       theme.primary.includes('red') ? '#dc2626' : '#2563eb',
                      color: '#ffffff'
                    }}
                  >
                    {sendingReport ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Report...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Report Now
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to manually trigger and send a business report immediately
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">About AI Business Analyst</h3>
                <p className="text-sm text-gray-700 mb-3">
                  The AI Business Analyst uses advanced natural language processing to help you understand your business data. 
                  It can answer questions, generate insights, and create visualizations based on your real-time data.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Natural language queries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Real-time data analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Visual chart generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700">Actionable insights</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

