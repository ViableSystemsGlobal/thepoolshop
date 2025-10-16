"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompanyContextType {
  companyName: string;
  description: string;
  favicon: string;
  isLoading: boolean;
  refreshCompanyData: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companyName, setCompanyName] = useState<string>('AdPools Group');
  const [description, setDescription] = useState<string>('A practical, single-tenant system for sales and distribution management');
  const [favicon, setFavicon] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/company');
      if (response.ok) {
        const data = await response.json();
        setCompanyName(data.companyName || 'AdPools Group');
        setDescription(data.description || 'A practical, single-tenant system for sales and distribution management');
        setFavicon(data.favicon || '');
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCompanyData = async () => {
    await fetchCompanyData();
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companyName,
        description,
        favicon,
        isLoading,
        refreshCompanyData
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}