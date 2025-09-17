"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Package, DollarSign, Tag, Hash, FileText, Calendar, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  images?: string | null;
  attributes?: any;
  uomBase: string;
  uomSell: string;
  price?: number;
  cost?: number;
  importCurrency: string;
  active: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  stockItem?: {
    id: string;
    productId: string;
    quantity: number;
    reserved: number;
    available: number;
  };
}

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ViewProductModal({ isOpen, onClose, product }: ViewProductModalProps) {
  if (!isOpen || !product) return null;

  // Parse images from JSON string
  let images: string[] = [];
  if (product.images) {
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        images = [];
      }
    } else if (Array.isArray(product.images)) {
      images = product.images;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Header */}
          <div className="flex items-start space-x-6">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`h-full w-full flex items-center justify-center ${images.length > 0 ? 'hidden' : 'flex'}`}>
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description || 'No description provided'}</p>
              
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  product.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">
                  SKU: {product.sku}
                </span>
              </div>
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <span className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Base Unit</span>
                  <span className="text-sm text-gray-900">{product.uomBase}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Selling Unit</span>
                  <span className="text-sm text-gray-900">{product.uomSell}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Import Currency</span>
                  <span className="text-sm text-gray-900">{product.importCurrency}</span>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Selling Price</span>
                  <span className="text-sm text-gray-900">{formatCurrency(product.price || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Cost Price</span>
                  <span className="text-sm text-gray-900">{formatCurrency(product.cost || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Profit Margin</span>
                  <span className="text-sm text-gray-900">
                    {product.price && product.cost 
                      ? `${(((product.price - product.cost) / product.price) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Quantity</span>
                  <span className="text-sm text-gray-900">{product.stockItem?.quantity || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Reserved</span>
                  <span className="text-sm text-gray-900">{product.stockItem?.reserved || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Available</span>
                  <span className={`text-sm font-medium ${
                    (product.stockItem?.available || 0) === 0
                      ? "text-red-600"
                      : (product.stockItem?.available || 0) < 20
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}>
                    {product.stockItem?.available || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Product ID</span>
                  <span className="text-sm text-gray-900 font-mono">{product.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={() => {
                // This would open the edit modal
                console.log('Edit product:', product.id);
              }}
            >
              Edit Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
