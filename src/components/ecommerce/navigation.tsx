"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Package, Search, User, Home as HomeIcon, LogOut } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/customer-auth-context";

export function EcommerceNavigation() {
  const router = useRouter();
  const { branding } = useBranding();
  const { customer, logout, loading: authLoading } = useCustomerAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/public/shop/cart");
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.itemCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0 ml-6">
            {branding.companyLogo ? (
              <div className="relative h-16 w-auto">
                <Image
                  src={branding.companyLogo}
                  alt={branding.companyName || "The POOLSHOP"}
                  width={180}
                  height={64}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </div>
            ) : (
              <>
                <Package className="h-12 w-12 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{branding.companyName || "The POOLSHOP"}</span>
              </>
            )}
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <nav className="hidden md:flex items-center space-x-4 flex-shrink-0 -ml-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link href="/shop" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
              <Package className="h-5 w-5" />
              <span>Shop</span>
            </Link>
            <Link href="/shop/cart" className="relative flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
                {customer ? (
                  <Link href="/shop/account" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
                    <User className="h-5 w-5" />
                    <span>My Account</span>
                  </Link>
                ) : (
                  <Link href="/shop/auth/login" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                )}
          </nav>

          <div className="md:hidden flex items-center space-x-2">
            <Link
              href="/shop/cart"
              className="relative flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {customer ? (
              <Link
                href="/shop/account"
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/shop/auth/login"
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </form>
      </div>
    </header>
  );
}

