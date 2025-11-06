"use client";

import { EcommerceNavigation } from "./navigation";
import { EcommerceFooter } from "./footer";

export function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <EcommerceNavigation />
      <main className="flex-1">
        {children}
      </main>
      <EcommerceFooter />
    </div>
  );
}

