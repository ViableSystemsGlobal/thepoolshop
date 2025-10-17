"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu-custom";
import { useTheme } from "@/contexts/theme-context";
import { DollarSign, ChevronDown } from "lucide-react";

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

// Utility function to format currency with actual conversion
export function formatCurrency(amount: number, currency: string = 'GHS', fromCurrency: string = 'USD'): string {
  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  
  // For now, we'll use a simple conversion. In production, this should use real exchange rates
  let convertedAmount = amount;
  if (fromCurrency !== currency) {
    // Simple conversion rates - in production, fetch from your exchange rate API
    const conversionRates: { [key: string]: { [key: string]: number } } = {
      'USD': { 'GHS': 12.5, 'EUR': 0.85 },
      'GHS': { 'USD': 0.08, 'EUR': 0.068 },
      'EUR': { 'USD': 1.18, 'GHS': 14.7 }
    };
    
    const rate = conversionRates[fromCurrency]?.[currency];
    if (rate) {
      convertedAmount = amount * rate;
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
