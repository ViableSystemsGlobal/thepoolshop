"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { 
  DollarSign, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Save,
  Settings,
  TrendingUp,
  Globe
} from "lucide-react";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

interface ExchangeRate {
  id?: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

interface CurrencySettings {
  baseCurrency: string;
  defaultExchangeRateSource: string;
  autoUpdateExchangeRates: boolean;
  exchangeRateUpdateInterval: string;
  currencies: Currency[];
  exchangeRates: ExchangeRate[];
}

export default function CurrencySettingsPage() {
  const { success, error: showError } = useToast();
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [baseCurrency, setBaseCurrency] = useState('GHS');
  const [defaultExchangeRateSource, setDefaultExchangeRateSource] = useState('manual');
  const [autoUpdateExchangeRates, setAutoUpdateExchangeRates] = useState(false);
  const [exchangeRateUpdateInterval, setExchangeRateUpdateInterval] = useState('daily');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    fetchCurrencySettings();
  }, []);

  const fetchCurrencySettings = async () => {
    try {
      const response = await fetch('/api/settings/currency');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setBaseCurrency(data.baseCurrency);
        setDefaultExchangeRateSource(data.defaultExchangeRateSource);
        setAutoUpdateExchangeRates(data.autoUpdateExchangeRates);
        setExchangeRateUpdateInterval(data.exchangeRateUpdateInterval);
        setExchangeRates(data.exchangeRates || []);
      } else {
        showError('Failed to load currency settings');
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error);
      showError('Error loading currency settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/currency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseCurrency,
          defaultExchangeRateSource,
          autoUpdateExchangeRates,
          exchangeRateUpdateInterval,
          exchangeRates
        }),
      });

      if (response.ok) {
        success('Currency settings saved successfully');
        fetchCurrencySettings(); // Refresh data
      } else {
        showError('Failed to save currency settings');
      }
    } catch (error) {
      console.error('Error saving currency settings:', error);
      showError('Error saving currency settings');
    } finally {
      setIsSaving(false);
    }
  };

  const addExchangeRate = () => {
    const newRate: ExchangeRate = {
      fromCurrency: 'USD',
      toCurrency: 'GHS',
      rate: 12.5,
      source: 'manual',
      effectiveFrom: new Date().toISOString().split('T')[0],
      isActive: true
    };
    setExchangeRates([...exchangeRates, newRate]);
  };

  const updateExchangeRate = (index: number, field: keyof ExchangeRate, value: any) => {
    const updated = [...exchangeRates];
    updated[index] = { ...updated[index], [field]: value };
    setExchangeRates(updated);
  };

  const removeExchangeRate = (index: number) => {
    setExchangeRates(exchangeRates.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 ml-3">Loading currency settings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Currency Settings</h1>
            <p className="text-gray-600">Configure system currency and exchange rates</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Base Currency Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Base Currency Configuration
            </CardTitle>
            <CardDescription>
              Set the system's base currency and default settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Currency
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GHS">GHS - Ghana Cedi (GH₵)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rate Source
                </label>
                <select
                  value={defaultExchangeRateSource}
                  onChange={(e) => setDefaultExchangeRateSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="api">External API</option>
                  <option value="bank">Bank Rate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoUpdate"
                  checked={autoUpdateExchangeRates}
                  onChange={(e) => setAutoUpdateExchangeRates(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="autoUpdate" className="text-sm font-medium text-gray-700">
                  Auto-update exchange rates
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Interval
                </label>
                <select
                  value={exchangeRateUpdateInterval}
                  onChange={(e) => setExchangeRateUpdateInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!autoUpdateExchangeRates}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rates Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Exchange Rates
                </CardTitle>
                <CardDescription>
                  Manage currency exchange rates for accurate conversions
                </CardDescription>
              </div>
              <Button onClick={addExchangeRate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Rate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exchangeRates.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exchange rates configured</h3>
                <p className="text-gray-600 mb-4">
                  Add exchange rates to enable currency conversions
                </p>
                <Button onClick={addExchangeRate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Rate
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {exchangeRates.map((rate, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                        <select
                          value={rate.fromCurrency}
                          onChange={(e) => updateExchangeRate(index, 'fromCurrency', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="USD">USD</option>
                          <option value="GHS">GHS</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                        <select
                          value={rate.toCurrency}
                          onChange={(e) => updateExchangeRate(index, 'toCurrency', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="USD">USD</option>
                          <option value="GHS">GHS</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Rate</label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={rate.rate}
                          onChange={(e) => updateExchangeRate(index, 'rate', parseFloat(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Effective From</label>
                        <Input
                          type="date"
                          value={rate.effectiveFrom}
                          onChange={(e) => updateExchangeRate(index, 'effectiveFrom', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={rate.isActive}
                        onChange={(e) => updateExchangeRate(index, 'isActive', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Button
                        onClick={() => removeExchangeRate(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Currency Information
            </CardTitle>
            <CardDescription>
              Overview of configured currencies and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings?.currencies && settings.currencies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {settings.currencies.map((currency) => (
                  <div key={currency.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {currency.symbol} {currency.code}
                        </div>
                        <div className="text-sm text-gray-500">{currency.name}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currency.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currency.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No currencies configured</h3>
                <p className="text-gray-600">
                  Currencies will be automatically configured based on your settings
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
