import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import { ToastContainer } from "@/components/toast-container";

export const metadata: Metadata = {
  title: "AD Pools SM - Sales Management System",
  description: "A practical, single-tenant system for sales and distribution management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
        return (
          <html lang="en">
            <body className="antialiased">
              <ThemeProvider>
                <ToastProvider>
                  <AuthSessionProvider>
                    {children}
                    <ToastContainer />
                  </AuthSessionProvider>
                </ToastProvider>
              </ThemeProvider>
            </body>
          </html>
        );
}
