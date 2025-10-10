'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building, Users, User } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'account' | 'distributor' | 'lead';
  customerType?: 'STANDARD' | 'CREDIT';
  displayName: string;
  category: string;
  company?: string;
}

interface CustomerSearchProps {
  value: string;
  onChange: (customerId: string, customer: Customer | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CustomerSearch({ 
  value, 
  onChange, 
  placeholder = "Search customers...", 
  label = "Customer",
  required = false,
  disabled = false 
}: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchCustomers(searchTerm);
      } else {
        setCustomers([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCustomers = async (term: string) => {
    setIsLoading(true);
    try {
      console.log('🔍 Searching for customers with term:', term);
      const response = await fetch(`/api/customers/search?search=${encodeURIComponent(term)}`, {
        credentials: 'include'
      });
      console.log('🔍 Search response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Search response data:', data);
        setCustomers(data.customers || []);
        setIsOpen(true);
      } else {
        console.error('🔍 Search failed with status:', response.status);
        const errorData = await response.text();
        console.error('🔍 Search error:', errorData);
        setCustomers([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomers([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.displayName);
    setIsOpen(false);
    onChange(customer.id, customer);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setIsOpen(false);
    onChange('', null);
    inputRef.current?.focus();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'account':
        return <Building className="h-4 w-4" />;
      case 'distributor':
        return <Users className="h-4 w-4" />;
      case 'lead':
        return <User className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'account':
        return 'bg-blue-100 text-blue-800';
      case 'distributor':
        return 'bg-green-100 text-green-800';
      case 'lead':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="customer-search">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            id="customer-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (customers.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-10"
          />
          {selectedCustomer && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">
                Searching...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {searchTerm.length < 2 ? 'Type at least 2 characters to search' : 'No customers found'}
              </div>
            ) : (
              <>
                {/* Group by category */}
                {['CRM Customer', 'Distributor', 'Lead'].map(category => {
                  const categoryCustomers = customers.filter(c => c.category === category);
                  if (categoryCustomers.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {category}s
                      </div>
                      {categoryCustomers.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleSelect(customer)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        >
                          <div className="flex items-center space-x-3">
                            {getIcon(customer.type)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {customer.displayName}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                {customer.email && <span>{customer.email}</span>}
                                {customer.phone && <span>• {customer.phone}</span>}
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(customer.type)}`}>
                              {customer.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected Customer Info */}
      {selectedCustomer && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {getIcon(selectedCustomer.type)}
            <div>
              <div className="font-medium text-gray-900">{selectedCustomer.displayName}</div>
              <div className="text-sm text-gray-500">
                {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
                {selectedCustomer.phone && (
                  <span>{selectedCustomer.email ? ' • ' : ''}{selectedCustomer.phone}</span>
                )}
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedCustomer.type)}`}>
              {selectedCustomer.type}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
