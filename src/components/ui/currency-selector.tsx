"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ArrowRightLeft, 
  DollarSign,
  Calculator,
  RefreshCw
} from "lucide-react";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  amount?: number;
  onAmountChange?: (amount: number) => void;
  showConversion?: boolean;
  className?: string;
}

export function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  amount = 0,
  onAmountChange,
  showConversion = false,
  className = ""
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [currenciesError, setCurrenciesError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (showConversion && amount > 0) {
      convertCurrency();
    }
  }, [amount, selectedCurrency, showConversion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchCurrencies = async () => {
    try {
      setIsLoadingCurrencies(true);
      setCurrenciesError(null);
      
      // Default currencies that should always be available
      const defaultCurrencies: Currency[] = [
        { id: 'ghs-default', code: 'GHS', name: 'Ghana Cedi', symbol: 'GH₵', isActive: true },
        { id: 'usd-default', code: 'USD', name: 'US Dollar', symbol: '$', isActive: true }
      ];
      
      const response = await fetch('/api/currencies');
      if (response.ok) {
        const data = await response.json();
        
        // Merge database currencies with defaults, ensuring GHS and USD are always included
        const currencyMap = new Map<string, Currency>();
        
        // Add default currencies first
        defaultCurrencies.forEach(currency => {
          currencyMap.set(currency.code, currency);
        });
        
        // Add/override with database currencies (they might have better data)
        data.forEach((currency: Currency) => {
          currencyMap.set(currency.code, currency);
        });
        
        // Convert map to array and sort by code
        const mergedCurrencies = Array.from(currencyMap.values()).sort((a, b) => 
          a.code.localeCompare(b.code)
        );
        
        setCurrencies(mergedCurrencies);
      } else {
        // If API fails, use defaults
        setCurrencies(defaultCurrencies);
        setCurrenciesError('Failed to load currencies');
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // On error, use defaults so GHS and USD are always available
      const defaultCurrencies: Currency[] = [
        { id: 'ghs-default', code: 'GHS', name: 'Ghana Cedi', symbol: 'GH₵', isActive: true },
        { id: 'usd-default', code: 'USD', name: 'US Dollar', symbol: '$', isActive: true }
      ];
      setCurrencies(defaultCurrencies);
      setCurrenciesError('Failed to load currencies');
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const convertCurrency = async () => {
    if (!amount || amount <= 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrency: 'USD', // Assuming base currency is USD
          toCurrency: selectedCurrency,
          amount: amount
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConvertedAmount(data.convertedAmount);
        setExchangeRate(data.exchangeRate);
      }
    } catch (error) {
      console.error('Error converting currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  return (
    <div ref={dropdownRef} className={`space-y-2 relative ${className}`}>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className="text-lg">{selectedCurrencyData?.symbol || '$'}</span>
          <span className="font-medium">{selectedCurrency}</span>
          <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {onAmountChange && (
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            placeholder="0.00"
            className="w-32"
            step="0.01"
            min="0"
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-64 mt-1 bg-white shadow-lg border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Select Currency</h3>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {isLoadingCurrencies ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                Loading currencies...
              </div>
            ) : currenciesError ? (
              <div className="p-3 text-sm text-red-500 text-center">
                {currenciesError}
                <button 
                  onClick={fetchCurrencies}
                  className="ml-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Retry
                </button>
              </div>
            ) : currencies.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No currencies available
              </div>
            ) : (
              currencies.map((currency) => (
                <button
                  key={currency.id}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md hover:bg-gray-50 transition-colors ${
                    selectedCurrency === currency.code 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onCurrencyChange(currency.code);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-lg mr-3">{currency.symbol}</span>
                  <div className="flex-1">
                    <div className="font-medium">{currency.code}</div>
                    <div className="text-sm text-gray-500">{currency.name}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {showConversion && convertedAmount !== null && (
        <Card className="mt-2">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">USD {amount.toFixed(2)}</span>
              </div>
              
              <ArrowRightLeft className="h-4 w-4 text-gray-400" />
              
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedCurrencyData?.symbol}</span>
                <span className="font-medium">
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    convertedAmount.toFixed(2)
                  )}
                </span>
              </div>
            </div>
            
            {exchangeRate && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Rate: 1 USD = {exchangeRate.toFixed(4)} {selectedCurrency}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CurrencySelector;
