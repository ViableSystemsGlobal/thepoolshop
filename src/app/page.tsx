"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Shield, Package, Star, Truck, ArrowRight, Search, ShoppingCart } from "lucide-react"
import { useBranding } from "@/contexts/branding-context"
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/youtube-utils"
import { BannerSlider } from "@/components/ecommerce/banner-slider"
import { EcommerceLayout } from "@/components/ecommerce/layout"
import { CustomerAuthProvider } from "@/contexts/customer-auth-context"

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

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isShopDomain, setIsShopDomain] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [banners, setBanners] = useState<any[]>([])
  const { branding } = useBranding()

  useEffect(() => {
    // Set mounted on client side only
    setMounted(true)
    
    // Only proceed if we're on the client
    if (typeof window === 'undefined') return
    
    // Wait for session to be ready
    if (status === "loading") return

    const hostname = window.location.hostname
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80')
    const isAdminDomain = hostname.includes('sms.') || hostname.includes('admin.')
    const isAdminPort = port === '3001'
    const isShopPort = port === '3000'
    const isShop = isShopPort || (!isAdminDomain && !isAdminPort)

    setIsShopDomain(isShop)

    // Admin domain/port - redirect to dashboard or login
    if (isAdminDomain || isAdminPort) {
      if (session) {
        router.push("/dashboard")
      } else {
        router.push("/auth/signin")
      }
      return
    }

    // Shop domain - fetch homepage data
    if (isShop) {
      fetchFeaturedProducts()
      fetchCategories()
      fetchBanners()
    }
  }, [session, status, router])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch("/api/public/shop/products?limit=8&sort=newest")
      if (response.ok) {
        const data = await response.json()
        setFeaturedProducts(data.products?.slice(0, 8) || [])
      } else {
        console.error("Failed to fetch featured products:", response.status)
        setFeaturedProducts([])
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error)
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/public/shop/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories?.slice(0, 6) || [])
      } else {
        console.error("Failed to fetch categories:", response.status)
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setCategories([])
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/public/shop/banners")
      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
      } else {
        console.error("Failed to fetch banners:", response.status)
        setBanners([])
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error)
      setBanners([])
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm)}`)
    } else {
      router.push("/shop")
    }
  }

  const formatPrice = (price: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price)
  }

  // Show consistent loading state until mounted (prevents hydration mismatch)
  // Server and client must render the exact same initial content
  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show ecommerce homepage on shop domain
  if (isShopDomain) {
    return (
      <CustomerAuthProvider>
        <EcommerceLayout>

        {/* Hero Section */}
        <section className="relative text-white overflow-hidden w-full" style={{ minHeight: '800px' }}>
          {/* Video Background */}
          {branding.heroVideo ? (
            <div className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }}>
              {isYouTubeUrl(branding.heroVideo) ? (
                // YouTube embed - fills entire hero section
                <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ width: '100%', height: '100%' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(branding.heroVideo) || ''}
                    className="absolute pointer-events-none"
                    allow="autoplay"
                    allowFullScreen
                    style={{
                      pointerEvents: 'none',
                      top: '50%',
                      left: '50%',
                      width: '100vw',
                      height: '56.25vw', // 16:9 aspect ratio
                      minHeight: '100%',
                      minWidth: '177.77vh', // 16:9 aspect ratio
                      transform: 'translate(-50%, -50%) scale(1.2)',
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              ) : (
                // Regular video file - fills entire hero section
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                  }}
                >
                  <source src={branding.heroVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-indigo-900/70 z-10"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
          )}
          
          <div className="relative z-20 w-full mx-auto px-4 md:px-8 lg:px-12 py-24 md:py-40 lg:py-48">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                Welcome to The POOLSHOP
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-blue-100">
                Everything Swimming Pool and more...
              </p>
              <p className="text-lg md:text-xl mb-10 text-blue-200">
                Your one-stop shop for premium pool products, accessories, and expert solutions
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Link
                  href="/shop"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg flex items-center justify-center"
                >
                  Browse All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/shop?category=all"
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition border-2 border-white"
                >
                  View Categories
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bottom Wave - Subtle transition (optional decorative element) */}
          {/* Uncomment below to show the wave decoration */}
          {/* <div className="absolute bottom-0 left-0 right-0 z-10" style={{ pointerEvents: 'none' }}>
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" opacity="0.8"/>
            </svg>
          </div> */}
        </section>

        {/* Features Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
                <p className="text-gray-600">Free delivery on orders over ₵500</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Checkout</h3>
                <p className="text-gray-600">Safe and secure payment processing</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">Authentic products guaranteed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories & Banners Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-gray-600 text-lg">
                Explore our wide range of pool products
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Categories - 2x2 Grid */}
              <div>
                {categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6">
                    {categories.slice(0, 4).map((category) => (
                      <Link
                        key={category.id}
                        href={`/shop?category=${category.id}`}
                        className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all hover:scale-105"
                      >
                        <div className="text-center">
                          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition">
                            <Package className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.productCount} products</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 text-center">
                    <p className="text-gray-500">No categories available</p>
                  </div>
                )}
              </div>

              {/* Banner Slider */}
              <div className="w-full">
                {banners.length > 0 ? (
                  <BannerSlider banners={banners} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center min-h-[300px]">
                    <p className="text-gray-500">No banners available</p>
                  </div>
                )}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="text-center mt-10">
                <Link
                  href="/shop"
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                >
                  View All Categories
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Featured Products
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Check out our latest and most popular items
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700"
                >
                  View All
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                      <div className="bg-gray-200 h-48 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/products/${product.id}`}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition group"
                    >
                      <div className="relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
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
                            Sale
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
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
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center mt-10 md:hidden">
                <Link
                  href="/shop"
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Dive In?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Browse our complete catalog of pool products and accessories
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg text-lg"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </div>
        </section>
      </EcommerceLayout>
      </CustomerAuthProvider>
    )
  }

  // Default landing page for localhost or other cases (only show after mounted)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl p-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            The POOLSHOP
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Your trusted partner for quality products and services
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/shop"
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Shop Online
              </h2>
              <p className="text-gray-600 mb-4">
                Browse our products and shop from the comfort of your home
              </p>
              <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Visit Shop →
              </span>
            </Link>

            <Link
              href={session ? "/dashboard" : "/auth/signin"}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Admin Portal
              </h2>
              <p className="text-gray-600 mb-4">
                Manage inventory, orders, and business operations
              </p>
              <span className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                {session ? "Go to Dashboard →" : "Sign In →"}
              </span>
            </Link>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            © 2024 The POOLSHOP. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}