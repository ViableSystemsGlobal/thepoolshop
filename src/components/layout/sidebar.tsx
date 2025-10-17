"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { useAbilities } from "@/hooks/use-abilities";
import { useSession } from "next-auth/react";
import { SkeletonSidebar } from "@/components/ui/skeleton";
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
  MapPin,
  FileText,
  Folder,
  Shield,
  Bell,
  Smartphone,
  History,
  Send,
  Mail,
  CheckSquare,
  Calendar,
  Printer,
} from "lucide-react";

const navigation = [
  { 
    name: "Home", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    badge: null,
    module: "dashboard"
  },
  { 
    name: "CRM", 
    href: "/crm", 
    icon: Users,
    badge: null,
    module: "crm",
    children: [
      { name: "Leads", href: "/crm/leads", icon: UserCheck, module: "leads" },
      { name: "Opportunities", href: "/crm/opportunities", icon: BarChart3, module: "opportunities" },
      { name: "Accounts", href: "/crm/accounts", icon: Building, module: "accounts" },
      { name: "Contacts", href: "/crm/contacts", icon: Users, module: "contacts" },
    ]
  },
  { 
    name: "DRM", 
    href: null, 
    icon: Handshake,
    badge: null,
    module: "drm",
    children: [
      { name: "Distributor Leads", href: "/drm/distributor-leads", icon: Users, module: "distributor-leads" },
      { name: "Distributors", href: "/drm/distributors", icon: Building, module: "distributors" },
      { name: "Routes & Mapping", href: "/drm/routes-mapping", icon: MapPin, module: "routes-mapping" },
      { name: "Engagement", href: "/drm/engagement", icon: MessageSquare, module: "engagement" },
    ]
  },
  { 
    name: "Sales", 
    href: "/sales", 
    icon: ShoppingCart,
    badge: null,
    module: "sales",
    children: [
      { name: "Orders", href: "/orders", icon: ShoppingCart, module: "orders" },
      { name: "Quotations", href: "/quotations", icon: FileText, module: "quotations" },
      { name: "Invoices", href: "/invoices", icon: FileText, module: "invoices" },
      { name: "Payments", href: "/payments", icon: CreditCard, module: "payments" },
      { name: "Returns", href: "/returns", icon: Package, module: "returns" },
    ]
  },
  { 
    name: "Inventory", 
    href: "/inventory", 
    icon: Warehouse,
    badge: null,
    module: "inventory",
    children: [
      { name: "All Products", href: "/products", icon: Package, module: "products" },
      { name: "Product Labels", href: "/products/labels", icon: Printer, module: "products" },
      { name: "Price Lists", href: "/price-lists", icon: FileText, module: "price-lists" },
      { name: "Stock Overview", href: "/inventory/stock", icon: BarChart3, module: "inventory" },
      { name: "Stock Movements", href: "/inventory/stock-movements", icon: BarChart3, module: "inventory" },
      { name: "Physical Count", href: "/inventory/stocktake", icon: CheckSquare, module: "inventory" },
      { name: "Warehouses", href: "/warehouses", icon: Building, module: "warehouses" },
      { name: "Backorders", href: "/backorders", icon: Package, module: "backorders" },
    ]
  },
        { 
          name: "Communication", 
          href: "/communication", 
          icon: MessageSquare,
          badge: null,
          module: "communication",
          children: [
            { name: "SMS Messages", href: "/communication/sms", icon: Smartphone, module: "sms" },
            { name: "SMS History", href: "/communication/sms-history", icon: History, module: "sms-history" },
            { name: "Email Messages", href: "/communication/email", icon: Mail, module: "email" },
            { name: "Email History", href: "/communication/email-history", icon: History, module: "email-history" },
            { name: "Templates", href: "/templates", icon: FileText, module: "templates" },
            { name: "Logs", href: "/communication-logs", icon: BarChart3, module: "communication-logs" },
          ]
        },
  { 
    name: "Agents", 
    href: "/agents", 
    icon: UserCheck,
    badge: null,
    module: "agents",
    children: [
      { name: "Agents", href: "/agents", icon: Users, module: "agents" },
      { name: "Commissions", href: "/commissions", icon: CreditCard, module: "commissions" },
    ]
  },
  { 
    name: "Tasks", 
    href: "/tasks", 
    icon: CheckSquare,
    badge: null,
    module: "tasks",
    children: [
      { name: "All Tasks", href: "/tasks", icon: CheckSquare, module: "tasks" },
      { name: "My Tasks", href: "/tasks/my", icon: Calendar, module: "my-tasks" },
    ]
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: BarChart3,
    badge: null,
    module: "reports"
  },
  { 
    name: "AI Business Analyst", 
    href: "/ai-analyst", 
    icon: BarChart3,
    badge: null,
    module: "ai_analyst"
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings,
    badge: null,
    module: "settings",
    children: [
      { name: "User Management", href: "/settings/users", icon: Users, module: "users" },
      { name: "Role Management", href: "/settings/roles", icon: Shield, module: "roles" },
      { name: "Notifications", href: "/settings/notifications", icon: Bell, module: "notifications" },
      { name: "Notification Templates", href: "/settings/notification-templates", icon: FileText, module: "notification_templates" },
      { name: "Task Templates", href: "/settings/task-templates", icon: CheckSquare, module: "task_templates" },
      { name: "Lead Sources", href: "/settings/lead-sources", icon: UserCheck, module: "lead_sources" },
      { name: "Product Settings", href: "/settings/products", icon: Package, module: "product-settings" },
      { name: "Currency Settings", href: "/settings/currency", icon: DollarSign, module: "currency-settings" },
      { name: "Business Settings", href: "/settings/business", icon: Building, module: "business-settings" },
      { name: "Google Maps", href: "/settings/google-maps", icon: MapPin, module: "google-maps" },
      { name: "Credit Monitoring", href: "/settings/credit-monitoring", icon: CreditCard, module: "credit-monitoring" },
      { name: "AI Settings", href: "/settings/ai", icon: BarChart3, module: "ai-settings" },
      { name: "System Settings", href: "/settings/system", icon: Settings, module: "system-settings" },
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { getThemeClasses, customLogo } = useTheme();
  const theme = getThemeClasses();
  const { canAccess, loading: abilitiesLoading } = useAbilities();
  const { data: session, status: sessionStatus } = useSession();

  // Show skeleton loading during initial load, while abilities are loading, or session is loading
  useEffect(() => {
    if (sessionStatus !== 'loading' && !abilitiesLoading) {
      // Add a small delay to ensure skeleton shows during hard refresh
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionStatus, abilitiesLoading]);

  // Define isActive function before using it in useEffect
  const isActive = (href: string) => {
    if (pathname === href) return true;
    
    // Special case for /tasks routes
    if (href === "/tasks") {
      // Only match if we're exactly on /tasks, not on /tasks/my or other sub-routes
      return pathname === "/tasks";
    }
    
    // Special case for /products - only match exact /products, not /products/labels
    if (href === "/products") {
      return pathname === "/products";
    }
    
    // For other child routes, only match if it's a direct child (not a grandchild)
    if (pathname.startsWith(href + "/")) {
      const remainingPath = pathname.slice(href.length + 1);
      // Only match if there's no additional path segments (direct child)
      return !remainingPath.includes("/");
    }
    
    return false;
  };

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

  if (isInitialLoad || abilitiesLoading || sessionStatus === 'loading') {
    return <SkeletonSidebar />;
  }

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
        {navigation
          .filter(item => canAccess(item.module))
          .map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.name);
            const isActiveItem = (item.href && isActive(item.href)) || (hasChildren && item.children!.some(child => isActive(child.href)));

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
                  href={item.href || '#'}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left",
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
                  {item.children!
                    .filter(child => {
                      // Special handling for Tasks module
                      if (child.module === "tasks" || child.module === "my-tasks") {
                        // All roles can access My Tasks
                        if (child.module === "my-tasks") {
                          return true;
                        }
                        // Only Super Admin and Admin can access All Tasks
                        if (child.module === "tasks") {
                          const userRole = session?.user?.role;
                          return userRole === "SUPER_ADMIN" || userRole === "ADMIN";
                        }
                      }
                      // Default access control for other modules
                      return canAccess(child.module);
                    })
                    .map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left",
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