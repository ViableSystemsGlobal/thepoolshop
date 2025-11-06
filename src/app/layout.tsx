import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/contexts/theme-context";
import { BrandingProvider } from "@/contexts/branding-context";
import { ToastProvider } from "@/contexts/toast-context";
import { LoadingProvider } from "@/contexts/loading-context";
import { CompanyProvider } from "@/contexts/company-context";
import { ToastContainer } from "@/components/toast-container";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { TaskNotificationStarter } from "@/components/task-notification-starter";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { AppLayout } from "@/components/layout/app-layout";
import { InitialLoader } from "@/components/initial-loader";
import { ConditionalAdminComponents } from "@/components/conditional-admin-components";

export const metadata: Metadata = {
  title: "Sales Management System",
  description: "A practical, single-tenant system for sales and distribution management",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
        return (
          <html lang="en">
            <body className="antialiased" suppressHydrationWarning={true}>
              <HydrationBoundary>
                <BrandingProvider>
                  <ThemeProvider>
                    <LoadingProvider>
                      <ToastProvider>
                        <CompanyProvider>
                          <AuthSessionProvider>
                            <InitialLoader />
                            <ConditionalAdminComponents>
                            <TaskNotificationStarter />
                            </ConditionalAdminComponents>
                            <DynamicFavicon />
                            <AppLayout>
                              {children}
                            </AppLayout>
                            <ToastContainer />
                          </AuthSessionProvider>
                        </CompanyProvider>
                      </ToastProvider>
                    </LoadingProvider>
                  </ThemeProvider>
                </BrandingProvider>
              </HydrationBoundary>
            </body>
          </html>
        );
}
