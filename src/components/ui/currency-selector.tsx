"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (showConversion && amount > 0) {
      convertCurrency();
    }
  }, [amount, selectedCurrency, showConversion]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('/api/currencies');
      if (response.ok) {
        const data = await response.json();
        setCurrencies(data);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
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
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          <span className="text-lg">{selectedCurrencyData?.symbol || '$'}</span>
          <span>{selectedCurrency}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>

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
        <Card className="absolute z-10 w-64 mt-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {currencies.map((currency) => (
              <Button
                key={currency.id}
                variant={selectedCurrency === currency.code ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onCurrencyChange(currency.code);
                  setIsOpen(false);
                }}
              >
                <span className="text-lg mr-2">{currency.symbol}</span>
                <span className="font-medium">{currency.code}</span>
                <span className="text-sm text-gray-500 ml-2">{currency.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
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
