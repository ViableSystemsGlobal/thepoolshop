'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { 
  Mail, 
  MessageSquare, 
  Save,
  RefreshCw,
  TestTube,
  Settings,
  Bell,
  Send,
  AlertTriangle,
  ShoppingCart,
  Users,
  DollarSign,
  FileText,
  MessageCircle
} from 'lucide-react';

// Template interfaces
interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
}

// Default email templates
const DEFAULT_EMAIL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'stock_low',
    name: 'Low Stock Alert',
    subject: 'Low Stock Alert: {{productName}}',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e67e22;">Low Stock Alert</h2>
  <p>Hello {{recipientName}},</p>
  
  <p>The following product is running low on stock:</p>
  
  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Product:</strong> {{productName}}<br>
    <strong>SKU:</strong> {{productSku}}<br>
    <strong>Current Stock:</strong> {{currentStock}} units<br>
    <strong>Reorder Point:</strong> {{reorderPoint}} units<br>
    <strong>Warehouse:</strong> {{warehouseName}}
  </div>
  
  <p>Please consider placing a new order to avoid stockouts.</p>
  
  <p>Best regards,<br>
  AdPools Group Inventory System</p>
</div>
    `.trim(),
    variables: ['recipientName', 'productName', 'productSku', 'currentStock', 'reorderPoint', 'warehouseName']
  },
  {
    id: 'stock_out',
    name: 'Out of Stock Alert',
    subject: 'Out of Stock: {{productName}}',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e74c3c;">Out of Stock Alert</h2>
  <p>Hello {{recipientName}},</p>
  
  <p><strong>URGENT:</strong> The following product is now out of stock:</p>
  
  <div style="background: #fdf2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
    <strong>Product:</strong> {{productName}}<br>
    <strong>SKU:</strong> {{productSku}}<br>
    <strong>Current Stock:</strong> 0 units<br>
    <strong>Warehouse:</strong> {{warehouseName}}
  </div>
  
  <p>Please place an urgent order to restock this item.</p>
  
  <p>Best regards,<br>
  AdPools Group Inventory System</p>
</div>
    `.trim(),
    variables: ['recipientName', 'productName', 'productSku', 'warehouseName']
  },
  {
    id: 'new_order',
    name: 'New Order Notification',
    subject: 'New Order Received: #{{orderNumber}}',
    body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #27ae60;">New Order Received</h2>
  <p>Hello {{recipientName}},</p>
  
  <p>A new order has been received:</p>
  
  <div style="background: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Order Number:</strong> #{{orderNumber}}<br>
    <strong>Customer:</strong> {{customerName}}<br>
    <strong>Total Amount:</strong> {{currency}}{{totalAmount}}<br>
    <strong>Items:</strong> {{itemCount}} items<br>
    <strong>Date:</strong> {{orderDate}}
  </div>
  
  <p>Please process this order as soon as possible.</p>
  
  <p>Best regards,<br>
  AdPools Group Order System</p>
</div>
    `.trim(),
    variables: ['recipientName', 'orderNumber', 'customerName', 'totalAmount', 'currency', 'itemCount', 'orderDate']
  }
];

// Default SMS templates
const DEFAULT_SMS_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'stock_low',
    name: 'Low Stock Alert',
    body: 'ALERT: {{productName}} ({{productSku}}) is running low. Current stock: {{currentStock}} units. Reorder point: {{reorderPoint}} units.',
    variables: ['productName', 'productSku', 'currentStock', 'reorderPoint']
  },
  {
    id: 'stock_out',
    name: 'Out of Stock Alert',
    body: 'URGENT: {{productName}} ({{productSku}}) is OUT OF STOCK! Please place an urgent order.',
    variables: ['productName', 'productSku']
  },
  {
    id: 'new_order',
    name: 'New Order Notification',
    body: 'New Order #{{orderNumber}} received from {{customerName}} for {{currency}}{{totalAmount}}. {{itemCount}} items.',
    variables: ['orderNumber', 'customerName', 'totalAmount', 'currency', 'itemCount']
  }
];

// System notification types
const NOTIFICATION_TYPES = [
  {
    id: 'stock_low',
    name: 'Low Stock Alert',
    description: 'When product stock falls below reorder point',
    icon: AlertTriangle,
    category: 'Inventory'
  },
  {
    id: 'stock_out',
    name: 'Out of Stock Alert',
    description: 'When product is completely out of stock',
    icon: AlertTriangle,
    category: 'Inventory'
  },
  {
    id: 'new_order',
    name: 'New Order',
    description: 'When a new order is placed',
    icon: ShoppingCart,
    category: 'Orders'
  },
  {
    id: 'order_status',
    name: 'Order Status Change',
    description: 'When order status is updated',
    icon: ShoppingCart,
    category: 'Orders'
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    description: 'When payment is received for an order',
    icon: DollarSign,
    category: 'Payments'
  },
  {
    id: 'user_created',
    name: 'New User Created',
    description: 'When a new user account is created',
    icon: Users,
    category: 'Users'
  },
  {
    id: 'user_login',
    name: 'User Login',
    description: 'When a user logs into the system',
    icon: Users,
    category: 'Users'
  },
  {
    id: 'system_backup',
    name: 'System Backup',
    description: 'System backup completion notifications',
    icon: Settings,
    category: 'System'
  }
];

interface NotificationSettings {
  email: {
    enabled: boolean;
    smtp: {
      host: string;
      port: string;
      username: string;
      password: string;
      encryption: string;
      fromAddress: string;
      fromName: string;
    };
    notifications: { [key: string]: boolean };
  };
  sms: {
    enabled: boolean;
    provider: {
      name: string;
      username: string;
      password: string;
      senderId: string;
      baseUrl: string;
    };
    notifications: { [key: string]: boolean };
  };
}

const defaultSettings: NotificationSettings = {
  email: {
    enabled: false,
    smtp: {
      host: '',
      port: '587',
      username: '',
      password: '',
      encryption: 'tls',
      fromAddress: '',
      fromName: 'AdPools Group'
    },
    notifications: {}
  },
  sms: {
    enabled: false,
    provider: {
      name: 'deywuro',
      username: '',
      password: '',
      senderId: '',
      baseUrl: 'https://deywuro.com/api'
    },
    notifications: {}
  }
};

export default function NotificationSettingsPage() {
  const { themeColor, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { data: session } = useSession();
  const { success: showSuccess, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'email' | 'sms' | 'routing' | 'email-templates' | 'sms-templates'>('email');
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [showSMSPopup, setShowSMSPopup] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<NotificationTemplate[]>(DEFAULT_EMAIL_TEMPLATES);
  const [smsTemplates, setSmsTemplates] = useState<NotificationTemplate[]>(DEFAULT_SMS_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/notifications');
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || defaultSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        showSuccess('Notification settings saved successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to save notification settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestClick = (type: 'email' | 'sms') => {
    if (type === 'email') {
      setTestEmail(session?.user?.email || '');
      setShowEmailPopup(true);
    } else if (type === 'sms') {
      setTestPhone('');
      setShowSMSPopup(true);
    } else {
      handleTest(type);
    }
  };

  const handleTest = async (type: 'email' | 'sms', email?: string, phone?: string) => {
    try {
      setIsTesting(type);
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          channel: type, 
          settings,
          testRecipient: type === 'email' ? (email || testEmail) : (phone || testPhone)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test response data:', data);
        if (data.success) {
          showSuccess(`${type.toUpperCase()} test successful!`);
          if (type === 'email') {
            setShowEmailPopup(false);
          } else if (type === 'sms') {
            setShowSMSPopup(false);
          }
        } else {
          showError(`${type.toUpperCase()} test failed: ${data.message}`);
        }
      } else {
        const errorText = await response.text();
        console.log('Test error response:', errorText);
        showError(`Failed to test ${type}`);
      }
    } catch (error) {
      console.error(`Error testing ${type}:`, error);
      showError(`Failed to test ${type}`);
    } finally {
      setIsTesting(null);
    }
  };

  const sendTestNotification = async (notificationType: string) => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notificationType,
          test: true,
          data: { message: 'This is a test notification' }
        }),
      });

      if (response.ok) {
        showSuccess(`Test ${notificationType} notification sent`);
      } else {
        showError(`Failed to send test notification`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      showError('Failed to send test notification');
    }
  };

  const updateEmailSetting = (key: string, value: string | boolean) => {
    if (key.startsWith('notifications.')) {
      const notificationKey = key.replace('notifications.', '');
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          notifications: {
            ...prev.email.notifications,
            [notificationKey]: value as boolean
          }
        }
      }));
    } else if (key.startsWith('smtp.')) {
      const smtpKey = key.replace('smtp.', '');
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          smtp: {
            ...prev.email.smtp,
            [smtpKey]: value as string
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          [key]: value
        }
      }));
    }
  };

  const updateSMSSetting = (key: string, value: string | boolean) => {
    if (key.startsWith('notifications.')) {
      const notificationKey = key.replace('notifications.', '');
      setSettings(prev => ({
        ...prev,
        sms: {
          ...prev.sms,
          notifications: {
            ...prev.sms.notifications,
            [notificationKey]: value as boolean
          }
        }
      }));
    } else if (key.startsWith('provider.')) {
      const providerKey = key.replace('provider.', '');
      setSettings(prev => ({
        ...prev,
        sms: {
          ...prev.sms,
          provider: {
            ...prev.sms.provider,
            [providerKey]: value as string
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        sms: {
          ...prev.sms,
          [key]: value
        }
      }));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
            <p className="text-gray-500">Loading notification settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure system notifications, email and SMS settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save All Settings
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="h-4 w-4 inline mr-2" />
              Email Configuration
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sms'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2" />
              SMS Configuration
            </button>
            <button
              onClick={() => setActiveTab('routing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'routing'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 inline mr-2" />
              Notification Routing
            </button>
            <button
              onClick={() => setActiveTab('email-templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email-templates'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Email Templates
            </button>
            <button
              onClick={() => setActiveTab('sms-templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sms-templates'
                  ? `border-${themeClasses.primary} text-${themeClasses.primary}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              SMS Templates
            </button>
          </nav>
        </div>


        {/* Content */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            {/* Email Enable/Disable */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Enable or disable email notifications</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleTestClick('email')}
                    disabled={isTesting === 'email' || !settings.email.enabled}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isTesting === 'email' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test Email
                  </Button>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={settings.email.enabled}
                      onCheckedChange={(checked) => updateEmailSetting('enabled', checked as boolean)}
                    />
                    <span className="text-sm font-medium">Enable Email</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* SMTP Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">SMTP Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={settings.email.smtp.host}
                    onChange={(e) => updateEmailSetting('smtp.host', e.target.value)}
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    value={settings.email.smtp.port}
                    onChange={(e) => updateEmailSetting('smtp.port', e.target.value)}
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpEncryption">Encryption</Label>
                  <select
                    id="smtpEncryption"
                    value={settings.email.smtp.encryption}
                    onChange={(e) => updateEmailSetting('smtp.encryption', e.target.value)}
                    disabled={!settings.email.enabled}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="smtpUsername">Username</Label>
                  <Input
                    id="smtpUsername"
                    name="smtpUsername"
                    type="text"
                    autoComplete="email"
                    placeholder="your-email@gmail.com"
                    value={settings.email.smtp.username}
                    onChange={(e) => updateEmailSetting('smtp.username', e.target.value)}
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">Password</Label>
                  <Input
                    id="smtpPassword"
                    name="smtpPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={settings.email.smtp.password === '***' ? 'Password is saved (enter new to change)' : 'Your password or app password'}
                    value={settings.email.smtp.password === '***' ? '' : settings.email.smtp.password}
                    onChange={(e) => updateEmailSetting('smtp.password', e.target.value)}
                    disabled={!settings.email.enabled}
                  />
                  {settings.email.smtp.password === '***' && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Password is saved. Enter a new password to change it.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    placeholder="AdPools Group"
                    value={settings.email.smtp.fromName}
                    onChange={(e) => updateEmailSetting('smtp.fromName', e.target.value)}
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="fromAddress">From Email Address</Label>
                  <Input
                    id="fromAddress"
                    placeholder="noreply@adpoolsgroup.com"
                    value={settings.email.smtp.fromAddress}
                    onChange={(e) => updateEmailSetting('smtp.fromAddress', e.target.value)}
                    disabled={!settings.email.enabled}
                  />
                </div>
              </div>
            </Card>

            {/* Email Notifications */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Email Notification Types</h3>
              <p className="text-sm text-gray-500 mb-4">Select which notifications should be sent via email</p>
              <div className="space-y-4">
                {Object.entries(
                  NOTIFICATION_TYPES.reduce((acc, type) => {
                    if (!acc[type.category]) acc[type.category] = [];
                    acc[type.category].push(type);
                    return acc;
                  }, {} as { [key: string]: typeof NOTIFICATION_TYPES })
                ).map(([category, types]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {types.map((type) => (
                        <label key={type.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <Checkbox
                            checked={settings.email.notifications[type.id] || false}
                            onCheckedChange={(checked) => updateEmailSetting(`notifications.${type.id}`, checked as boolean)}
                            disabled={!settings.email.enabled}
                          />
                          <div className="flex items-start gap-2 flex-1">
                            <type.icon className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">{type.name}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              sendTestNotification(type.id);
                            }}
                            disabled={!settings.email.enabled || !settings.email.notifications[type.id]}
                            className="text-xs"
                          >
                            Test
                          </Button>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-6">
            {/* SMS Enable/Disable */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Enable or disable SMS notifications</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleTestClick('sms')}
                    disabled={isTesting === 'sms' || !settings.sms.enabled}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isTesting === 'sms' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test SMS
                  </Button>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={settings.sms.enabled}
                      onCheckedChange={(checked) => updateSMSSetting('enabled', checked as boolean)}
                    />
                    <span className="text-sm font-medium">Enable SMS</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* SMS Provider Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">SMS Provider Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smsProvider">SMS Provider</Label>
                  <select
                    id="smsProvider"
                    value={settings.sms.provider.name}
                    onChange={(e) => updateSMSSetting('provider.name', e.target.value)}
                    disabled={!settings.sms.enabled}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="deywuro">Deywuro</option>
                    <option value="twilio">Twilio</option>
                    <option value="aws">AWS SNS</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="senderId">Sender ID</Label>
                  <Input
                    id="senderId"
                    placeholder="AdPools"
                    value={settings.sms.provider.senderId}
                    onChange={(e) => updateSMSSetting('provider.senderId', e.target.value)}
                    disabled={!settings.sms.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smsUsername">Username</Label>
                  <Input
                    id="smsUsername"
                    name="smsUsername"
                    type="text"
                    autoComplete="username"
                    placeholder="Deywuro username"
                    value={settings.sms.provider.username}
                    onChange={(e) => updateSMSSetting('provider.username', e.target.value)}
                    disabled={!settings.sms.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smsPassword">Password</Label>
                  <Input
                    id="smsPassword"
                    name="smsPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={settings.sms.provider.password === '***' ? 'Password is saved (enter new to change)' : 'Deywuro password'}
                    value={settings.sms.provider.password === '***' ? '' : settings.sms.provider.password}
                    onChange={(e) => updateSMSSetting('provider.password', e.target.value)}
                    disabled={!settings.sms.enabled}
                  />
                  {settings.sms.provider.password === '***' && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Password is saved. Enter a new password to change it.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://api.deywuro.com"
                    value={settings.sms.provider.baseUrl}
                    onChange={(e) => updateSMSSetting('provider.baseUrl', e.target.value)}
                    disabled={!settings.sms.enabled}
                  />
                </div>
              </div>
            </Card>

            {/* SMS Notifications */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">SMS Notification Types</h3>
              <p className="text-sm text-gray-500 mb-4">Select which notifications should be sent via SMS</p>
              <div className="space-y-4">
                {Object.entries(
                  NOTIFICATION_TYPES.reduce((acc, type) => {
                    if (!acc[type.category]) acc[type.category] = [];
                    acc[type.category].push(type);
                    return acc;
                  }, {} as { [key: string]: typeof NOTIFICATION_TYPES })
                ).map(([category, types]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {types.map((type) => (
                        <label key={type.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <Checkbox
                            checked={settings.sms.notifications[type.id] || false}
                            onCheckedChange={(checked) => updateSMSSetting(`notifications.${type.id}`, checked as boolean)}
                            disabled={!settings.sms.enabled}
                          />
                          <div className="flex items-start gap-2 flex-1">
                            <type.icon className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">{type.name}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              sendTestNotification(type.id);
                            }}
                            disabled={!settings.sms.enabled || !settings.sms.notifications[type.id]}
                            className="text-xs"
                          >
                            Test
                          </Button>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'routing' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Notification Routing Overview</h3>
            <p className="text-sm text-gray-500 mb-6">
              This shows which notification types are enabled for each channel. Configure individual channels in their respective tabs.
            </p>
            
            <div className="space-y-4">
              {Object.entries(
                NOTIFICATION_TYPES.reduce((acc, type) => {
                  if (!acc[type.category]) acc[type.category] = [];
                  acc[type.category].push(type);
                  return acc;
                }, {} as { [key: string]: typeof NOTIFICATION_TYPES })
              ).map(([category, types]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-700 mb-3">{category}</h4>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div key={type.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <type.icon className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{type.name}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className={`text-xs px-2 py-1 rounded ${
                              settings.email.enabled && settings.email.notifications[type.id]
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {settings.email.enabled && settings.email.notifications[type.id] ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span className={`text-xs px-2 py-1 rounded ${
                              settings.sms.enabled && settings.sms.notifications[type.id]
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {settings.sms.enabled && settings.sms.notifications[type.id] ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Email Templates Tab */}
        {activeTab === 'email-templates' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium">Email Templates</h3>
                  <p className="text-sm text-gray-500">Customize email message templates for different notification types</p>
                </div>
                <Button
                  onClick={() => {
                    setIsCreatingNew(true);
                    setEditingTemplate({
                      id: '',
                      name: '',
                      subject: '',
                      body: '',
                      variables: []
                    });
                  }}
                  className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add New Template
                </Button>
              </div>
              
              <div className="space-y-4">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-500">Template ID: {template.id}</p>
                      </div>
                      <Button
                        onClick={() => setEditingTemplate(template)}
                        variant="outline"
                        size="sm"
                      >
                        Edit Template
                      </Button>
                    </div>
                    
                    {template.subject && (
                      <div className="mb-3">
                        <Label className="text-sm font-medium">Subject</Label>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                          {template.subject}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium">Body Preview</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: template.body.substring(0, 200) + '...' }} />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Available Variables</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SMS Templates Tab */}
        {activeTab === 'sms-templates' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium">SMS Templates</h3>
                  <p className="text-sm text-gray-500">Customize SMS message templates for different notification types</p>
                </div>
                <Button
                  onClick={() => {
                    setIsCreatingNew(true);
                    setEditingTemplate({
                      id: '',
                      name: '',
                      body: '',
                      variables: []
                    });
                  }}
                  className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add New Template
                </Button>
              </div>
              
              <div className="space-y-4">
                {smsTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-500">Template ID: {template.id}</p>
                      </div>
                      <Button
                        onClick={() => setEditingTemplate(template)}
                        variant="outline"
                        size="sm"
                      >
                        Edit Template
                      </Button>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Message</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                        {template.body}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Characters: {template.body.length}/160
                      </p>
                    </div>
                    
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Available Variables</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isCreatingNew ? 'Create New Template' : `Edit Template: ${editingTemplate.name}`}
              </h3>
              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreatingNew(false);
                }}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Template ID and Name fields for new templates */}
              {isCreatingNew && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateId">Template ID</Label>
                      <Input
                        id="templateId"
                        value={editingTemplate.id}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                        })}
                        placeholder="e.g., custom_alert"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use lowercase letters, numbers, and underscores only
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          name: e.target.value
                        })}
                        placeholder="e.g., Custom Alert"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {editingTemplate.subject !== undefined && (
                <div>
                  <Label htmlFor="templateSubject">Subject</Label>
                  <Input
                    id="templateSubject"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value
                    })}
                    placeholder="Enter email subject"
                    className="mt-1"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="templateBody">Message Body</Label>
                <textarea
                  id="templateBody"
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    body: e.target.value
                  })}
                  placeholder="Enter message body"
                  className="mt-1 w-full h-64 p-3 border border-gray-300 rounded-md resize-none"
                  rows={10}
                />
                {activeTab === 'sms-templates' && (
                  <p className="mt-1 text-sm text-gray-500">
                    Characters: {editingTemplate.body.length}/160
                  </p>
                )}
              </div>
              
              {/* Variables section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Available Variables</Label>
                  {isCreatingNew && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add variable (e.g., customerName)"
                          className="text-sm w-48"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const newVariable = input.value.trim();
                              if (newVariable && !editingTemplate.variables.includes(newVariable)) {
                                setEditingTemplate({
                                  ...editingTemplate,
                                  variables: [...editingTemplate.variables, newVariable]
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add variable (e.g., customerName)"]') as HTMLInputElement;
                            const newVariable = input.value.trim();
                            if (newVariable && !editingTemplate.variables.includes(newVariable)) {
                              setEditingTemplate({
                                ...editingTemplate,
                                variables: [...editingTemplate.variables, newVariable]
                              });
                              input.value = '';
                            }
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Common variables:</span>
                        {['recipientName', 'productName', 'productSku', 'currentStock', 'reorderPoint', 'warehouseName', 'orderNumber', 'customerName', 'totalAmount', 'currency', 'itemCount', 'orderDate'].map(variable => (
                          <button
                            key={variable}
                            onClick={() => {
                              if (!editingTemplate.variables.includes(variable)) {
                                setEditingTemplate({
                                  ...editingTemplate,
                                  variables: [...editingTemplate.variables, variable]
                                });
                              }
                            }}
                            disabled={editingTemplate.variables.includes(variable)}
                            className={`text-xs px-2 py-1 rounded ${
                              editingTemplate.variables.includes(variable)
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                            }`}
                          >
                            {variable}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-1 flex flex-wrap gap-2">
                  {editingTemplate.variables.map((variable) => (
                    <div key={variable} className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const textarea = document.getElementById('templateBody') as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after = text.substring(end, text.length);
                          const variableText = `{{${variable}}}`;
                          
                          setEditingTemplate({
                            ...editingTemplate,
                            body: before + variableText + after
                          });
                          
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + variableText.length, start + variableText.length);
                          }, 0);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 cursor-pointer"
                      >
                        {`{{${variable}}}`}
                      </button>
                      {isCreatingNew && (
                        <button
                          onClick={() => {
                            setEditingTemplate({
                              ...editingTemplate,
                              variables: editingTemplate.variables.filter(v => v !== variable)
                            });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <p className="mt-1 text-xs text-gray-500">
                  Click on a variable to insert it into the message
                  {isCreatingNew && ' • Click × to remove a variable'}
                </p>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsCreatingNew(false);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Validate required fields for new templates
                    if (isCreatingNew) {
                      if (!editingTemplate.id || !editingTemplate.name || !editingTemplate.body) {
                        showError('Please fill in all required fields (ID, Name, and Body)');
                        return;
                      }
                      
                      // Check if ID already exists
                      const existingTemplates = activeTab === 'email-templates' ? emailTemplates : smsTemplates;
                      if (existingTemplates.some(t => t.id === editingTemplate.id)) {
                        showError('Template ID already exists. Please choose a different ID.');
                        return;
                      }
                    }
                    
                    // Update or create the template in the appropriate state
                    if (activeTab === 'email-templates') {
                      if (isCreatingNew) {
                        setEmailTemplates(prev => [...prev, editingTemplate]);
                        showSuccess('Email template created successfully');
                      } else {
                        setEmailTemplates(prev => 
                          prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
                        );
                        showSuccess('Email template updated successfully');
                      }
                    } else {
                      if (isCreatingNew) {
                        setSmsTemplates(prev => [...prev, editingTemplate]);
                        showSuccess('SMS template created successfully');
                      } else {
                        setSmsTemplates(prev => 
                          prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
                        );
                        showSuccess('SMS template updated successfully');
                      }
                    }
                    
                    setEditingTemplate(null);
                    setIsCreatingNew(false);
                  }}
                  className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark}`}
                >
                  {isCreatingNew ? 'Create Template' : 'Save Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Test Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Send Test Email</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address to receive a test email notification:
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testEmailInput">Email Address</Label>
                <Input
                  id="testEmailInput"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowEmailPopup(false)}
                  disabled={isTesting === 'email'}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleTest('email')}
                  disabled={isTesting === 'email' || !testEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isTesting === 'email' ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Test Popup */}
      {showSMSPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Send Test SMS</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter a phone number to receive a test SMS notification:
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testPhoneInput">Phone Number</Label>
                <Input
                  id="testPhoneInput"
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g., +233244000000 or 0244000000"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +233 for Ghana) or start with 0
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setTestPhone('');
                    setShowSMSPopup(false);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleTest('sms', undefined, testPhone)}
                  disabled={!testPhone || isTesting === 'sms'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isTesting === 'sms' ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test SMS
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}