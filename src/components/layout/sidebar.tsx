"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  User,
  Building2,
  FileCheck,
  Truck,
  CreditCard,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Leads", href: "/leads", icon: User },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Proformas", href: "/proformas", icon: FileCheck },
  { name: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Truck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <span className="text-lg font-semibold text-gray-900">AD Pools</span>
            <div className="text-xs text-gray-500 -mt-1">Sales Management</div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-orange-50 text-orange-700 border border-orange-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive 
                    ? "text-orange-600" 
                    : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">
          <div className="font-medium text-gray-700">AD Pools SM</div>
          <div>Version 1.0.0</div>
        </div>
      </div>
    </div>
  )
}