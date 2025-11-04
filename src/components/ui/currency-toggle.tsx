"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu-custom";
import { useTheme } from "@/contexts/theme-context";
import { DollarSign, ChevronDown } from "lucide-react";

// Cache for exchange rates
let exchangeRatesCache: { [key: string]: number } = {};
let exchangeRatesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyToggleProps {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
}

const CURRENCIES: Currency[] = [
  { code: 'GHS', name: 'Ghana Cedi', symbol: 'GH₵' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export function CurrencyToggle({ value, onChange, className = "" }: CurrencyToggleProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const selectedCurrency = CURRENCIES.find(c => c.code === value) || CURRENCIES[0];

  const handleCurrencyChange = (currencyCode: string) => {
    onChange(currencyCode);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Currency:</span>
      <DropdownMenu
        trigger={
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2 min-w-[100px]"
          >
            <span className="text-lg font-medium">{selectedCurrency.symbol}</span>
            <span className="font-medium">{selectedCurrency.code}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        }
        items={CURRENCIES.map(currency => ({
          label: `${currency.symbol} ${currency.code} - ${currency.name}`,
          onClick: () => handleCurrencyChange(currency.code),
          className: value === currency.code ? `text-${theme.primaryText} bg-${theme.primaryBg}` : ''
        }))}
      />
    </div>
  );
}

// Hook for managing currency state across the application
export function useCurrency() {
  const [currency, setCurrency] = useState<string>('GHS');

  useEffect(() => {
    // Load currency preference from localStorage
    const savedCurrency = localStorage.getItem('displayCurrency');
    if (savedCurrency && CURRENCIES.find(c => c.code === savedCurrency)) {
      setCurrency(savedCurrency);
    }
    
    // Pre-fetch exchange rates to populate cache
    fetchExchangeRates();
  }, []);

  const changeCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('displayCurrency', newCurrency);
  };

  return {
    currency,
    changeCurrency,
    selectedCurrency: CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  };
}

// Function to fetch exchange rates from API
async function fetchExchangeRates(): Promise<{ [key: string]: number }> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (exchangeRatesCacheTime > 0 && (now - exchangeRatesCacheTime) < CACHE_DURATION) {
    return exchangeRatesCache;
  }
  
  try {
    const response = await fetch('/api/settings/currency');
    if (response.ok) {
      const data = await response.json();
      const rates: { [key: string]: number } = {};
      
      // Build a lookup map of exchange rates
      if (data.exchangeRates && Array.isArray(data.exchangeRates)) {
        data.exchangeRates.forEach((rate: any) => {
          if (rate.isActive && rate.fromCurrency && rate.toCurrency) {
            const key = `${rate.fromCurrency}_${rate.toCurrency}`;
            rates[key] = rate.rate;
            
            // Also store reverse rate for convenience
            const reverseKey = `${rate.toCurrency}_${rate.fromCurrency}`;
            if (!rates[reverseKey]) {
              rates[reverseKey] = 1 / rate.rate;
            }
          }
        });
      }
      
      exchangeRatesCache = rates;
      exchangeRatesCacheTime = now;
      return rates;
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
  }
  
  // Fallback to default rates if API fails
  return {
    'USD_GHS': 12.5,
    'GHS_USD': 0.08,
    'USD_EUR': 0.85,
    'EUR_USD': 1.18,
    'GHS_EUR': 0.068,
    'EUR_GHS': 14.7
  };
}

// Hook to get exchange rates (for components that need them)
export function useExchangeRates() {
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchExchangeRates().then(rates => {
      setRates(rates);
      setIsLoading(false);
    });
  }, []);
  
  return { rates, isLoading };
}

// Utility function to format currency with actual conversion
export function formatCurrency(amount: number, currency: string = 'GHS', fromCurrency: string = 'USD'): string {
  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  
  let convertedAmount = amount;
  if (fromCurrency !== currency) {
    const rateKey = `${fromCurrency}_${currency}`;
    
    // Try to use cached rate
    const rate = exchangeRatesCache[rateKey];
    
    if (rate) {
      convertedAmount = amount * rate;
    } else {
      // If not in cache, trigger async fetch for next time, but use fallback for now
      fetchExchangeRates().catch(() => {
        // If fetch fails, use fallback
        const fallbackRates: { [key: string]: { [key: string]: number } } = {
          'USD': { 'GHS': 12.5, 'EUR': 0.85 },
          'GHS': { 'USD': 0.08, 'EUR': 0.068 },
          'EUR': { 'USD': 1.18, 'GHS': 14.7 }
        };
        
        const fallbackRate = fallbackRates[fromCurrency]?.[currency];
        if (fallbackRate) {
          convertedAmount = amount * fallbackRate;
        }
      });
      
      // Use cached rate if available, otherwise wait for async fetch
      // For now, use a safe fallback
      const fallbackRates: { [key: string]: { [key: string]: number } } = {
      'USD': { 'GHS': 12.5, 'EUR': 0.85 },
      'GHS': { 'USD': 0.08, 'EUR': 0.068 },
      'EUR': { 'USD': 1.18, 'GHS': 14.7 }
    };
    
      const fallbackRate = fallbackRates[fromCurrency]?.[currency];
      if (fallbackRate) {
        convertedAmount = amount * fallbackRate;
      }
    }
  }
  
  // Format with proper symbol
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
  
  return `${selectedCurrency.symbol}${formatted}`;
}

// Utility function to convert between currencies
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRates: { fromCurrency: string; toCurrency: string; rate: number }[]
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = exchangeRates.find(r => 
    r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
  );
  
  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return amount; // Return original amount if rate not found
  }
  
  return amount * rate.rate;
}
