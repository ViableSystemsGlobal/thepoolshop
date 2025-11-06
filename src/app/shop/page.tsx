"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Search, Filter, ChevronRight, Star, ArrowUpDown, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/contexts/toast-context";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  currency: string;
  sku: string | null;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  inStock: boolean;
  stockQuantity: number;
  lowStock: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchCart();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, sortBy, searchTerm]);

  // Debounce search
  useEffect(() => {
    if (searchTerm === "") {
      if (page === 1) {
        fetchProducts();
      } else {
        setPage(1);
      }
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/public/shop/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sort: sortBy,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`/api/public/shop/products?${params}`);
      const data = await response.json();
      
      setProducts(data.products || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/public/shop/cart");
      const data = await response.json();
      setCartCount(data.itemCount || 0);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by debounced useEffect
  };

  const addToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      const response = await fetch("/api/public/shop/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartItemCount || cartCount + 1);
        const product = products.find(p => p.id === productId);
        success("Added to cart!", product?.name || "Product added successfully");
        await fetchCart(); // Refresh cart count
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to add to cart", errorData.availableStock ? `Only ${errorData.availableStock} available` : undefined);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showError("Failed to add to cart", "Please try again");
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="relative">

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ""}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPage(1);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">All Products</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setPage(1);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {category.name} ({category.productCount})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="font-medium mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                      <Link href={`/shop/products/${product.id}`}>
                        <div className="relative">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          {product.lowStock && (
                            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                              Low Stock
                            </span>
                          )}
                          {!product.inStock && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Out of Stock
                            </span>
                          )}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              {getDiscountPercentage(product.price, product.originalPrice)}% OFF
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link href={`/shop/products/${product.id}`}>
                          <h3 className="font-medium text-gray-900 mb-1 hover:text-blue-600">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {product.description || "No description available"}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price, product.currency)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice, product.currency)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {product.category?.name}
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={!product.inStock || addingToCart === product.id}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center ${
                            product.inStock
                              ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {addingToCart === product.id ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Adding...
                            </>
                          ) : product.inStock ? (
                            "Add to Cart"
                          ) : (
                            "Out of Stock"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 border rounded-lg ${
                              page === pageNum
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
