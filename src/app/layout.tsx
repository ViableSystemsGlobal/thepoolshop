import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import { LoadingProvider } from "@/contexts/loading-context";
import { ToastContainer } from "@/components/toast-container";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { TaskNotificationStarter } from "@/components/task-notification-starter";
import { DynamicFavicon } from "@/components/dynamic-favicon";

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
            <body className="antialiased" suppressHydrationWarning={true}>
              <HydrationBoundary>
                <ThemeProvider>
                  <LoadingProvider>
                    <ToastProvider>
                      <AuthSessionProvider>
                        <TaskNotificationStarter />
                        <DynamicFavicon />
                        {children}
                        <ToastContainer />
                      </AuthSessionProvider>
                    </ToastProvider>
                  </LoadingProvider>
                </ThemeProvider>
              </HydrationBoundary>
            </body>
          </html>
        );
}
