"use client"

import { usePathname } from "next/navigation"
import { MainLayout } from "./main-layout"
import { LoadingBar } from "@/components/ui/loading-bar"
import { useLoading } from "@/contexts/loading-context"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { isLoading } = useLoading()
  
  // Don't show layout on auth pages
  if (pathname.startsWith('/auth/')) {
    return <>{children}</>
  }
  
  // Show layout for all other pages
  return (
    <>
      <LoadingBar isLoading={isLoading} />
      <MainLayout>{children}</MainLayout>
    </>
  )
}
