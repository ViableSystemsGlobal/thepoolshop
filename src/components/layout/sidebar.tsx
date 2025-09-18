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
  DollarSign,
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
      { name: "Leads", href: "/crm/leads", icon: UserCheck },
      { name: "Opportunities", href: "/crm/opportunities", icon: BarChart3 },
      { name: "Quotations", href: "/crm/quotations", icon: FileText },
      { name: "Accounts", href: "/crm/accounts", icon: Building },
      { name: "Contacts", href: "/crm/contacts", icon: Users },
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
    name: "Inventory", 
    href: "/inventory", 
    icon: Warehouse,
    badge: null,
    children: [
      { name: "All Products", href: "/products", icon: Package },
      { name: "Price Lists", href: "/price-lists", icon: FileText },
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
      { name: "Currency Settings", href: "/settings/currency", icon: DollarSign },
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

  // Helper function to get proper background classes
  const getBackgroundClasses = (isActive: boolean, isHover: boolean = false) => {
    const prefix = isHover ? 'hover:' : '';
    const colorMap: { [key: string]: string } = {
      'purple-600': `${prefix}bg-purple-600`,
      'blue-600': `${prefix}bg-blue-600`,
      'green-600': `${prefix}bg-green-600`,
      'orange-600': `${prefix}bg-orange-600`,
      'red-600': `${prefix}bg-red-600`,
      'indigo-600': `${prefix}bg-indigo-600`,
      'pink-600': `${prefix}bg-pink-600`,
      'teal-600': `${prefix}bg-teal-600`,
    };
    return colorMap[theme.primary] || `${prefix}bg-blue-600`;
  };

  // Helper function to get hover background classes with safelist
  const getHoverBackgroundClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'hover:bg-purple-600',
      'blue-600': 'hover:bg-blue-600', 
      'green-600': 'hover:bg-green-600',
      'orange-600': 'hover:bg-orange-600',
      'red-600': 'hover:bg-red-600',
      'indigo-600': 'hover:bg-indigo-600',
      'pink-600': 'hover:bg-pink-600',
      'teal-600': 'hover:bg-teal-600',
    };
    return colorMap[theme.primary] || 'hover:bg-blue-600';
  };

  // Helper function to get proper text color classes
  const getTextColorClasses = (isHover: boolean = false) => {
    const prefix = isHover ? 'hover:' : '';
    const colorMap: { [key: string]: string } = {
      'purple-600': `${prefix}text-purple-600`,
      'blue-600': `${prefix}text-blue-600`,
      'green-600': `${prefix}text-green-600`,
      'orange-600': `${prefix}text-orange-600`,
      'red-600': `${prefix}text-red-600`,
      'indigo-600': `${prefix}text-indigo-600`,
      'pink-600': `${prefix}text-pink-600`,
      'teal-600': `${prefix}text-teal-600`,
    };
    return colorMap[theme.primary] || `${prefix}text-blue-600`;
  };

  // Helper function to get proper focus ring classes
  const getFocusRingClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'focus:ring-purple-500',
      'blue-600': 'focus:ring-blue-500',
      'green-600': 'focus:ring-green-500',
      'orange-600': 'focus:ring-orange-500',
      'red-600': 'focus:ring-red-500',
      'indigo-600': 'focus:ring-indigo-500',
      'pink-600': 'focus:ring-pink-500',
      'teal-600': 'focus:ring-teal-500',
    };
    return colorMap[theme.primary] || 'focus:ring-blue-500';
  };

  // Helper function to get proper gradient background classes
  const getGradientBackgroundClasses = () => {
    const colorMap: { [key: string]: string } = {
      'purple-600': 'bg-gradient-to-br from-purple-600 to-purple-700',
      'blue-600': 'bg-gradient-to-br from-blue-600 to-blue-700',
      'green-600': 'bg-gradient-to-br from-green-600 to-green-700',
      'orange-600': 'bg-gradient-to-br from-orange-600 to-orange-700',
      'red-600': 'bg-gradient-to-br from-red-600 to-red-700',
      'indigo-600': 'bg-gradient-to-br from-indigo-600 to-indigo-700',
      'pink-600': 'bg-gradient-to-br from-pink-600 to-pink-700',
      'teal-600': 'bg-gradient-to-br from-teal-600 to-teal-700',
    };
    return colorMap[theme.primary] || 'bg-gradient-to-br from-blue-600 to-blue-700';
  };

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
      <div className="flex h-20 items-center justify-center border-b border-gray-200 px-2">
        {customLogo ? (
          <img 
            src={customLogo} 
            alt="Logo" 
            className="h-16 w-auto max-w-full rounded-lg object-contain"
          />
        ) : (
          <div className={`h-16 w-16 rounded-lg ${getGradientBackgroundClasses()} flex items-center justify-center shadow-lg`}>
            <Building className="h-9 w-9 text-white" />
          </div>
        )}
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
                      ? `${getBackgroundClasses(true)} text-white`
                      : `text-gray-700 ${getHoverBackgroundClasses()} hover:text-white`
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      {item.name}
                      <span className={cn(
                        "ml-auto transition-colors",
                        isActiveItem ? "text-white" : "text-gray-400 group-hover:text-white"
                      )}>
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
                      ? `${getBackgroundClasses(true)} text-white`
                      : `text-gray-700 ${getHoverBackgroundClasses()} hover:text-white`
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
                          ? getTextColorClasses()
                          : `text-gray-600 ${getTextColorClasses(true)}`
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
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 ${getBackgroundClasses(true, true)} hover:text-white transition-colors`}
              >
                <div className="flex items-center">
                  <shortcut.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {shortcut.name}
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white ${getBackgroundClasses(true)}`}>
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