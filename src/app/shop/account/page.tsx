"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { User, Package, MapPin, LogOut, ShoppingBag, Settings } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading, logout } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/shop/auth/login");
    }
  }, [customer, loading, router]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Overview */}
            <div className="md:col-span-2 space-y-6">
              {/* Welcome Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-4">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Welcome, {customer.firstName || customer.name || customer.email.split("@")[0]}!
                    </h2>
                    <p className="text-gray-600">{customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/shop/account/orders"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">My Orders</div>
                      <div className="text-sm text-gray-600">View order history</div>
                    </div>
                  </Link>
                  <Link
                    href="/shop/account/addresses"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Addresses</div>
                      <div className="text-sm text-gray-600">Manage addresses</div>
                    </div>
                  </Link>
                  <Link
                    href="/shop/account/profile"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <Settings className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Profile</div>
                      <div className="text-sm text-gray-600">Edit profile</div>
                    </div>
                  </Link>
                  <Link
                    href="/shop"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <Package className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Continue Shopping</div>
                      <div className="text-sm text-gray-600">Browse products</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="font-medium text-gray-900">
                      {customer.firstName && customer.lastName 
                        ? `${customer.firstName} ${customer.lastName}`
                        : customer.name || customer.email.split("@")[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium text-gray-900">{customer.email}</div>
                  </div>
                  {customer.phone && (
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium text-gray-900">{customer.phone}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

