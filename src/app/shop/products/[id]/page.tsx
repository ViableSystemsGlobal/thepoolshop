"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, Package, Truck, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/contexts/toast-context";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  currency: string;
  sku: string | null;
  barcode: string | null;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  attributes: Record<string, any>;
  inStock: boolean;
  stockQuantity: number;
  lowStock: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/public/shop/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        // Product not found
        router.push("/shop");
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      router.push("/shop");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      const response = await fetch("/api/public/shop/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (response.ok) {
        success("Added to cart!", `${quantity} x ${product.name} added successfully`);
        // Reset quantity
        setQuantity(1);
        // Could also update cart count in header
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to add to cart", errorData.availableStock ? `Only ${errorData.availableStock} available` : undefined);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showError("Failed to add to cart", "Please try again");
    } finally {
      setAddingToCart(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-200 h-96 rounded"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div>
                <div className="relative">
                  {product.images && product.images.length > 0 ? (
                    <>
                      <img
                        src={product.images[selectedImage]}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded-lg"
                      />
                      {product.lowStock && (
                        <span className="absolute top-4 left-4 bg-orange-500 text-white text-sm px-3 py-1 rounded">
                          Low Stock - Only {product.stockQuantity} left
                        </span>
                      )}
                      {!product.inStock && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="absolute top-4 right-4 bg-green-500 text-white text-sm px-3 py-1 rounded">
                          {getDiscountPercentage(product.price, product.originalPrice)}% OFF
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2 mt-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? "border-blue-600" : "border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-4">
                  <Link href="/shop" className="hover:text-blue-600">Shop</Link>
                  <span className="mx-2">/</span>
                  <Link 
                    href={`/shop?category=${product.category.id}`}
                    className="hover:text-blue-600"
                  >
                    {product.category.name}
                  </Link>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900">{product.name}</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                {/* Rating placeholder */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">(4.0 out of 5)</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="ml-3 text-xl text-gray-500 line-through">
                        {formatPrice(product.originalPrice, product.currency)}
                      </span>
                    )}
                  </div>
                  {product.sku && (
                    <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">
                    {product.description || "No description available for this product."}
                  </p>
                </div>

                {/* Product Attributes */}
                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Product Details</h3>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-gray-500">{key}:</dt>
                          <dd className="text-gray-900 font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stockQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stockQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center px-3 py-1 border rounded-lg"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500">
                      ({product.stockQuantity} available)
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={addToCart}
                  disabled={!product.inStock || addingToCart}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                    product.inStock
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {addingToCart
                      ? "Adding..."
                      : product.inStock
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </span>
                </button>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Truck className="h-5 w-5 mr-3 text-blue-600" />
                    <span>Free delivery on orders over ₵500</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield className="h-5 w-5 mr-3 text-blue-600" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Package className="h-5 w-5 mr-3 text-blue-600" />
                    <span>Authentic products guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
