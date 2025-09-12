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
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Building2 className="h-8 w-8 text-orange-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">AD Pools SM</span>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-orange-50 text-orange-700 border-r-2 border-orange-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
