"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { MainLayout } from "./main-layout"
import { LoadingBar } from "@/components/ui/loading-bar"
import { useLoading } from "@/contexts/loading-context"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { isLoading } = useLoading()
  const [isRouteChanging, setIsRouteChanging] = useState(false)
  
  // Show loading bar on route changes
  useEffect(() => {
    setIsRouteChanging(true)
    const timer = setTimeout(() => {
      setIsRouteChanging(false)
    }, 500) // Show for 500ms on route change
    
    return () => clearTimeout(timer)
  }, [pathname])
  
  // Don't show layout on auth pages
  if (pathname.startsWith('/auth/')) {
    return <>{children}</>
  }
  
  // Show layout for all other pages
  return (
    <>
      <LoadingBar isLoading={isLoading || isRouteChanging} />
      <MainLayout>{children}</MainLayout>
    </>
  )
}
