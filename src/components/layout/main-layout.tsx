"use client"

import { useState, useEffect, memo } from "react"
import Sidebar from "./sidebar"
import { Header } from "./header"
import { FloatingChatButton } from "@/components/floating-chat-button"

interface MainLayoutProps {
  children: React.ReactNode
}

// Memoize Sidebar to prevent re-renders
const MemoizedSidebar = memo(Sidebar);

// Memoize Header to prevent re-renders
const MemoizedHeader = memo(Header);

export function MainLayout({ children }: MainLayoutProps) {
  const [chatBg, setChatBg] = useState("");

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('chatButtonBg');
    if (saved) setChatBg(saved);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <MemoizedSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MemoizedHeader />
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