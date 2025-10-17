"use client"

import { usePathname } from "next/navigation"
import { MainLayout } from "./main-layout"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  
  // Don't show layout on auth pages
  if (pathname.startsWith('/auth/')) {
    return <>{children}</>
  }
  
  // Show layout for all other pages
  return <MainLayout>{children}</MainLayout>
}
