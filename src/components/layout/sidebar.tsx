"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import {
  LayoutDashboard,
  Users,
  Handshake,
  ShoppingCart,
  Package,
  CreditCard,
  MessageSquare,
  UserCheck,
  BarChart3,
  Building,
  Warehouse,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Settings,
  FileText,
  Folder,
} from "lucide-react";

const navigation = [
  { 
    name: "Home", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    badge: null
  },
  { 
    name: "CRM", 
    href: "/crm", 
    icon: Users,
    badge: null,
    children: [
      { name: "Leads", href: "/leads", icon: UserCheck },
      { name: "Opportunities", href: "/opportunities", icon: BarChart3 },
      { name: "Quotations", href: "/quotations", icon: FileText },
      { name: "Accounts", href: "/accounts", icon: Building },
      { name: "Contacts", href: "/contacts", icon: Users },
    ]
  },
  { 
    name: "DRM", 
    href: "/drm", 
    icon: Handshake,
    badge: null,
    children: [
      { name: "Distributors", href: "/distributors", icon: Building },
      { name: "Agreements", href: "/agreements", icon: FileText },
      { name: "Orders", href: "/drm-orders", icon: Package },
    ]
  },
  { 
    name: "Sales", 
    href: "/sales", 
    icon: ShoppingCart,
    badge: null,
    children: [
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      { name: "Proformas", href: "/proformas", icon: FileText },
      { name: "Invoices", href: "/invoices", icon: FileText },
      { name: "Payments", href: "/payments", icon: CreditCard },
      { name: "Returns", href: "/returns", icon: Package },
    ]
  },
  { 
    name: "Products", 
    href: "/products", 
    icon: Package,
    badge: null,
    children: [
      { name: "All Products", href: "/products", icon: Package },
      { name: "Price Lists", href: "/price-lists", icon: FileText },
      { name: "Categories", href: "/settings/products/categories", icon: Folder },
    ]
  },
  { 
    name: "Inventory", 
    href: "/inventory", 
    icon: Warehouse,
    badge: null,
    children: [
      { name: "Stock Overview", href: "/inventory/stock", icon: BarChart3 },
      { name: "Stock Movements", href: "/inventory/stock-movements", icon: BarChart3 },
      { name: "Warehouses", href: "/warehouses", icon: Building },
      { name: "Backorders", href: "/backorders", icon: Package },
    ]
  },
  { 
    name: "POS", 
    href: "/pos", 
    icon: CreditCard,
    badge: null,
    children: [
      { name: "Register", href: "/pos/register", icon: CreditCard },
      { name: "End of Day", href: "/pos/end-of-day", icon: BarChart3 },
    ]
  },
  { 
    name: "Communication", 
    href: "/communication", 
    icon: MessageSquare,
    badge: null,
    children: [
      { name: "Templates", href: "/templates", icon: FileText },
      { name: "Logs", href: "/communication-logs", icon: BarChart3 },
    ]
  },
  { 
    name: "Agents", 
    href: "/agents", 
    icon: UserCheck,
    badge: null,
    children: [
      { name: "Agents", href: "/agents", icon: Users },
      { name: "Commissions", href: "/commissions", icon: CreditCard },
    ]
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: BarChart3,
    badge: null
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings,
    badge: null,
    children: [
      { name: "Product Settings", href: "/settings/products", icon: Package },
      { name: "Business Settings", href: "/settings/business", icon: Building },
      { name: "System Settings", href: "/settings/system", icon: Settings },
    ]
  },
];

const shortcuts = [
  { name: "Approvals", href: "/approvals", icon: UserCheck, badge: "3", badgeColor: "bg-purple-600" },
  { name: "Overdue Invoices", href: "/overdue", icon: FileText, badge: "7", badgeColor: "bg-purple-600" },
  { name: "Low Stock", href: "/low-stock", icon: Package, badge: "12", badgeColor: "bg-purple-600" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const { getThemeClasses, customLogo } = useTheme();
  const theme = getThemeClasses();

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Auto-expand sections when on child pages
  useEffect(() => {
    const shouldExpandSections: string[] = [];
    
    navigation.forEach(section => {
      if (section.children) {
        const hasActiveChild = section.children.some(child => isActive(child.href));
        if (hasActiveChild) {
          shouldExpandSections.push(section.name);
        }
      }
    });
    
    if (shouldExpandSections.length > 0) {
      setExpandedSections(prev => {
        const newExpanded = [...new Set([...prev, ...shouldExpandSections])];
        return newExpanded;
      });
    }
  }, [pathname]);

  return (
    <div className={cn(
      "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            {customLogo ? (
              <img 
                src={customLogo} 
                alt="Logo" 
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br from-${theme.primary} to-${theme.primaryDark} flex items-center justify-center`}>
                <Building className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-lg font-semibold text-gray-900">AD Pools</span>
          </div>
        )}
        {collapsed && (
          customLogo ? (
            <img 
              src={customLogo} 
              alt="Logo" 
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : (
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br from-${theme.primary} to-${theme.primaryDark} flex items-center justify-center`}>
              <Building className="h-5 w-5 text-white" />
            </div>
          )
        )}
      </div>

      {/* Test Mode Pill */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center rounded-full bg-${theme.primaryBg} px-2 py-1 text-xs font-medium text-${theme.primaryText}`}>
            Test Mode
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {navigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedSections.includes(item.name);
          const isActiveItem = isActive(item.href) || (hasChildren && item.children!.some(child => isActive(child.href)));

          return (
            <div key={item.name}>
              {hasChildren ? (
                <button
                  onClick={() => toggleSection(item.name)}
                  className={cn(
                    "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActiveItem
                      ? `bg-${theme.primaryBg} text-${theme.primaryText} border-l-2 border-${theme.primaryBorder}`
                      : `text-gray-700 hover:bg-${theme.primaryBg} hover:text-${theme.primaryText}`
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      {item.name}
                      <span className="ml-auto text-gray-400">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActiveItem
                      ? `bg-${theme.primaryBg} text-${theme.primaryText} border-l-2 border-${theme.primaryBorder}`
                      : `text-gray-700 hover:bg-${theme.primaryBg} hover:text-${theme.primaryText}`
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!collapsed && item.name}
                </Link>
              )}

              {/* Children */}
              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive(child.href)
                          ? `bg-${theme.primaryBg} text-${theme.primaryText}`
                          : `text-gray-600 hover:bg-${theme.primaryBg} hover:text-${theme.primaryText}`
                      )}
                    >
                      <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Shortcuts */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Shortcuts
          </div>
          <div className="space-y-1">
            {shortcuts.map((shortcut) => (
              <Link
                key={shortcut.name}
                href={shortcut.href}
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center">
                  <shortcut.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {shortcut.name}
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white bg-${theme.primary}`}>
                  {shortcut.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {!collapsed ? (
          <>
            {/* Business Unit Switch */}
            <div className="mb-4">
              <select className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}>
                <option>Retail</option>
                <option>Projects</option>
                <option>Wholesale</option>
              </select>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 mb-3">
              <div className={`h-8 w-8 rounded-full bg-gradient-to-br from-${theme.primaryLight} to-${theme.primary} flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">DU</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Demo User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  demo@adpools.com
                </p>
              </div>
            </div>

            {/* Help */}
            <div className="flex items-center text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Keyboard shortcuts
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">DU</span>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-gray-200 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>
    </div>
  );
}