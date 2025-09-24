'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CreditCard, 
  Bell, 
  Settings, 
  Play, 
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

interface CreditAlert {
  id: string;
  action: string;
  reason: string;
  notes: string;
  performedAt: string;
  distributor: {
    businessName: string;
    phone: string;
    email: string;
  };
}

interface CreditMonitoringSettings {
  monitoringEnabled: boolean;
  alertThreshold: number;
  overdueDays: number;
}

export default function CreditMonitoringPage() {
  const { data: session } = useSession();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { success, error } = useToast();
  
  const [alerts, setAlerts] = useState<CreditAlert[]>([]);
  const [settings, setSettings] = useState<CreditMonitoringSettings>({
    monitoringEnabled: true,
    alertThreshold: 80,
    overdueDays: 30
  });
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // Load credit monitoring data
  const loadCreditMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/credit-monitoring', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data.recentAlerts || []);
        setSettings(data.data.settings || settings);
      } else {
        console.error('Failed to load credit monitoring data. Status:', response.status);
        error('Failed to load credit monitoring data');
      }
    } catch (err) {
      console.error('Error loading credit monitoring data:', err);
      error('Error loading credit monitoring data');
    } finally {
      setLoading(false);
    }
  };

  // Run credit monitoring manually
  const runCreditMonitoring = async () => {
    try {
      setRunning(true);
      const response = await fetch('/api/credit-monitoring', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        success(data.message);
        // Reload data to show new alerts
        await loadCreditMonitoringData();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Failed to run credit monitoring');
      }
    } catch (err) {
      console.error('Error running credit monitoring:', err);
      error('Error running credit monitoring');
    } finally {
      setRunning(false);
    }
  };

  // Update monitoring settings
  const updateSettings = async (newSettings: Partial<CreditMonitoringSettings>) => {
    try {
      const response = await fetch('/api/settings/credit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          settings: {
            CREDIT_MONITORING_ENABLED: newSettings.monitoringEnabled?.toString() || settings.monitoringEnabled.toString(),
            CREDIT_ALERT_THRESHOLD: newSettings.alertThreshold?.toString() || settings.alertThreshold.toString(),
            CREDIT_OVERDUE_DAYS: newSettings.overdueDays?.toString() || settings.overdueDays.toString()
          }
        })
      });
      
      if (response.ok) {
        setSettings({ ...settings, ...newSettings });
        success('Credit monitoring settings updated successfully');
      } else {
        error('Failed to update credit monitoring settings');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      error('Error updating credit monitoring settings');
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadCreditMonitoringData();
    }
  }, [session?.user?.id]);

  const getAlertTypeColor = (action: string) => {
    switch (action) {
      case 'CREDIT_LIMIT_EXCEEDED':
        return 'bg-red-100 text-red-800';
      case 'HIGH_CREDIT_UTILIZATION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeLabel = (action: string) => {
    switch (action) {
      case 'CREDIT_LIMIT_EXCEEDED':
        return 'Credit Limit Exceeded';
      case 'HIGH_CREDIT_UTILIZATION':
        return 'High Credit Utilization';
      default:
        return action.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading credit monitoring data...</p>
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
            <h1 className="text-3xl font-bold">Credit Monitoring</h1>
            <p className="text-gray-600">Monitor distributor credit limits and send automated alerts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={runCreditMonitoring}
              disabled={running}
              className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark} flex items-center gap-2`}
            >
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {running ? 'Running...' : 'Run Now'}
            </Button>
            <Button
              onClick={loadCreditMonitoringData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monitoring Status</p>
                <p className="text-2xl font-bold">
                  {settings.monitoringEnabled ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                settings.monitoringEnabled ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {settings.monitoringEnabled ? (
                  <Bell className="w-6 h-6 text-green-600" />
                ) : (
                  <Pause className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alert Threshold</p>
                <p className="text-2xl font-bold">{settings.alertThreshold}%</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Settings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monitoring Settings</h3>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monitoring Enabled
              </label>
              <Button
                onClick={() => updateSettings({ monitoringEnabled: !settings.monitoringEnabled })}
                variant={settings.monitoringEnabled ? "default" : "outline"}
                size="sm"
                className="w-full"
              >
                {settings.monitoringEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.alertThreshold}
                  onChange={(e) => updateSettings({ alertThreshold: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="50"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overdue Days
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.overdueDays}
                  onChange={(e) => updateSettings({ overdueDays: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="90"
                />
                <span className="text-sm text-gray-500">days</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Credit Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent credit alerts</p>
              <p className="text-sm text-gray-500">Alerts will appear here when distributors exceed credit thresholds</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{alert.distributor.businessName}</h4>
                        <Badge className={getAlertTypeColor(alert.action)}>
                          {getAlertTypeLabel(alert.action)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(alert.performedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {alert.distributor.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {alert.distributor.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  {alert.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{alert.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
