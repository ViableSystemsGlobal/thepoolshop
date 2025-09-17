"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { Search, Bell, HelpCircle, User, LogOut, ChevronDown } from "lucide-react"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { getThemeClasses } = useTheme()
  const theme = getThemeClasses()

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/auth/signin',
      redirect: true 
    })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search anything..."
            className={`w-80 pl-10 h-9 border-gray-200 focus:border-${theme.primary} focus:ring-${theme.primaryBg}`}
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className={`h-9 w-9 text-gray-500 hover:text-${theme.primary} hover:bg-${theme.primaryBg}`}>
          <Bell className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className={`h-9 w-9 text-gray-500 hover:text-${theme.primary} hover:bg-${theme.primaryBg}`}>
          <HelpCircle className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-br from-${theme.primaryLight} to-${theme.primary} rounded-full flex items-center justify-center`}>
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user?.role || "Sales Rep"}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className={`h-8 w-8 text-gray-500 hover:text-${theme.primary} hover:bg-${theme.primaryBg}`}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}