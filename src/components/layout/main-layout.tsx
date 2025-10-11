"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import { Header } from "./header"
import { LoadingBar } from "@/components/ui/loading-bar"
import { useLoading } from "@/contexts/loading-context"
import { FloatingChatButton } from "@/components/floating-chat-button"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoading } = useLoading();
  const [chatBg, setChatBg] = useState("");

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('chatButtonBg');
    if (saved) setChatBg(saved);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <LoadingBar isLoading={isLoading} />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <FloatingChatButton customBackground={chatBg} />
    </div>
  )
}