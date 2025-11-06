"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { useToast } from "@/contexts/toast-context";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Check, 
  X,
  Home,
  Building,
  Star
} from "lucide-react";
import Link from "next/link";

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone?: string;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const { customer, loading: authLoading } = useCustomerAuth();
  const { success, error: showError } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    label: "Home",
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    phone: customer?.phone || "",
    street: "",
    city: "",
    region: "",
    country: "Ghana",
    postalCode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/shop/auth/login?redirect=/shop/account/addresses");
    }
  }, [authLoading, customer, router]);

  useEffect(() => {
    if (customer) {
      fetchAddresses();
      setFormData({
        ...formData,
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        phone: customer.phone || "",
      });
    }
  }, [customer]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/public/shop/addresses", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      label: "Home",
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      phone: customer?.phone || "",
      street: "",
      city: "",
      region: "",
      country: "Ghana",
      postalCode: "",
      isDefault: addresses.length === 0, // First address is default
    });
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone || "",
      street: address.street,
      city: address.city,
      region: address.region,
      country: address.country,
      postalCode: address.postalCode || "",
      isDefault: address.isDefault,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = editingAddress
        ? "/api/public/shop/addresses"
        : "/api/public/shop/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...(editingAddress && { id: editingAddress.id }),
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save address");
      }

      success(editingAddress ? "Address updated successfully!" : "Address added successfully!");
      setShowAddForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      showError(error instanceof Error ? error.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/public/shop/addresses?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      success("Address deleted successfully!");
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      showError("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const address = addresses.find((a) => a.id === id);
      if (!address) return;

      const response = await fetch("/api/public/shop/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id,
          ...address,
          isDefault: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      success("Default address updated!");
      fetchAddresses();
    } catch (error) {
      console.error("Error setting default address:", error);
      showError("Failed to set default address");
    }
  };

  const getLabelIcon = (label: string) => {
    if (label.toLowerCase().includes("home")) {
      return <Home className="h-5 w-5" />;
    } else if (label.toLowerCase().includes("work") || label.toLowerCase().includes("office")) {
      return <Building className="h-5 w-5" />;
    }
    return <MapPin className="h-5 w-5" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-6">
        <Link href="/shop" className="text-gray-500 hover:text-gray-700">
          Shop
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/shop/account" className="text-gray-500 hover:text-gray-700">
          My Account
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Addresses</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Address Book</h1>
          <p className="text-gray-600 mt-1">Manage your shipping and billing addresses</p>
        </div>
        <div className="flex items-center space-x-4">
          {!showAddForm && (
            <button
              onClick={handleAddAddress}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Add Address</span>
            </button>
          )}
          <Link
            href="/shop/account"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Account</span>
          </Link>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Label *
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set as Default
                </label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Use this as default address</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+233 XX XXX XXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region *
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-5 w-5" />
                <span>{saving ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 && !showAddForm ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-6">Add your first address to get started</p>
          <button
            onClick={handleAddAddress}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg shadow p-6 relative ${
                address.isDefault ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-4 right-4 flex items-center space-x-1 text-blue-600">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-xs font-medium">Default</span>
                </div>
              )}

              <div className="flex items-start space-x-3 mb-4">
                <div className="bg-blue-100 rounded-full p-2 text-blue-600">
                  {getLabelIcon(address.label)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{address.label}</h3>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p className="font-medium text-gray-900">
                  {address.firstName} {address.lastName}
                </p>
                {address.phone && <p>{address.phone}</p>}
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.region}
                </p>
                {address.postalCode && <p>{address.postalCode}</p>}
                <p>{address.country}</p>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                  disabled={address.isDefault && addresses.length > 1}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

