"use client";

import { EcommerceLayout } from "@/components/ecommerce/layout";
import { CustomerAuthProvider } from "@/contexts/customer-auth-context";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerAuthProvider>
      <EcommerceLayout>{children}</EcommerceLayout>
    </CustomerAuthProvider>
  );
}
