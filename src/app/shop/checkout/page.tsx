"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Truck, User, CheckCircle, Package } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/contexts/toast-context";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    region: "",
    postalCode: "",
    country: "Ghana",
  });

  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    region: "",
    postalCode: "",
    country: "Ghana",
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/public/shop/cart");
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        router.push("/shop/cart");
        return;
      }
      
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      router.push("/shop/cart");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name) newErrors.name = "Name is required";
    if (!customerInfo.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!customerInfo.phone) newErrors.phone = "Phone number is required";

    if (!shippingAddress.street) newErrors.shippingStreet = "Street address is required";
    if (!shippingAddress.city) newErrors.shippingCity = "City is required";
    if (!shippingAddress.region) newErrors.shippingRegion = "Region is required";

    if (!sameAsShipping) {
      if (!billingAddress.street) newErrors.billingStreet = "Billing street is required";
      if (!billingAddress.city) newErrors.billingCity = "Billing city is required";
      if (!billingAddress.region) newErrors.billingRegion = "Billing region is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setProcessing(true);

      // First, create the order/invoice
      const checkoutResponse = await fetch("/api/public/shop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: customerInfo,
          shippingAddress,
          billingAddress: sameAsShipping ? null : billingAddress,
          paymentMethod,
          notes,
        }),
      });

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json();
        showError(error.error || "Checkout failed", "Please check your information and try again");
        return;
      }

      const checkoutData = await checkoutResponse.json();
      const invoiceId = checkoutData.order?.id || checkoutData.order?.invoiceId;

      // If online payment, redirect to payment gateway
      if (paymentMethod === "ONLINE" || paymentMethod === "PAYSTACK") {
        setRedirectingToPayment(true);
        
        try {
          const paymentResponse = await fetch("/api/public/shop/payment/initiate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              invoiceId: invoiceId,
              paymentMethod: "ONLINE",
              amount: cart?.total || 0,
            }),
          });

          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            
            if (paymentData.authorizationUrl) {
              // Redirect to payment gateway
              window.location.href = paymentData.authorizationUrl;
              return;
            } else {
              throw new Error("No authorization URL received from payment gateway");
            }
          } else {
            const error = await paymentResponse.json();
            throw new Error(error.error || "Failed to initiate payment");
          }
        } catch (paymentError) {
          console.error("Payment initiation error:", paymentError);
          showError(
            "Payment initiation failed",
            paymentError instanceof Error ? paymentError.message : "Please try again or use a different payment method"
          );
          setRedirectingToPayment(false);
          setProcessing(false);
          return;
        }
      } else {
        // For non-online payments, complete the order normally
        setOrderDetails(checkoutData.order);
        setOrderComplete(true);
        success("Order placed successfully!", `Order #${checkoutData.order.invoiceNumber} has been created`);
        // Clear cart is handled by the API
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showError("Checkout error", "An error occurred. Please try again");
    } finally {
      if (paymentMethod !== "ONLINE" && paymentMethod !== "PAYSTACK") {
        setProcessing(false);
      }
    }
  };

  const formatPrice = (price: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. We've sent a confirmation email to {customerInfo.email}
              </p>

              <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
                <h3 className="font-semibold mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{orderDetails.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">
                      {formatPrice(orderDetails.total, orderDetails.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">{orderDetails.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <Link
                href="/shop/cart"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mt-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Cart</span>
              </Link>
            </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold">Customer Information</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        value={customerInfo.company}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <Truck className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold">Shipping Address</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.shippingStreet ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingStreet && (
                        <p className="text-red-500 text-xs mt-1">{errors.shippingStreet}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.shippingCity ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.shippingCity && (
                          <p className="text-red-500 text-xs mt-1">{errors.shippingCity}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Region/State *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.region}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, region: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.shippingRegion ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.shippingRegion && (
                          <p className="text-red-500 text-xs mt-1">{errors.shippingRegion}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Billing address same as shipping</span>
                  </label>
                </div>

                {/* Billing Address */}
                {!sameAsShipping && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.street}
                          onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.billingStreet ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.billingStreet && (
                          <p className="text-red-500 text-xs mt-1">{errors.billingStreet}</p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.billingCity ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                          {errors.billingCity && (
                            <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Region/State *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.region}
                            onChange={(e) => setBillingAddress({ ...billingAddress, region: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.billingRegion ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                          {errors.billingRegion && (
                            <p className="text-red-500 text-xs mt-1">{errors.billingRegion}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: "ONLINE", label: "Pay Online (Card/Mobile Money)", description: "Secure online payment via Paystack" },
                      { value: "CASH", label: "Cash on Delivery", description: "Pay when you receive your order" },
                      { value: "BANK_TRANSFER", label: "Bank Transfer", description: "Transfer funds directly to our account" },
                      { value: "MOBILE_MONEY", label: "Mobile Money", description: "Pay via MTN/Vodafone/AirtelTigo Mobile Money" },
                    ].map((method) => (
                      <label key={method.value} className="flex items-start cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3 mt-1"
                        />
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium block">{method.label}</span>
                          {method.description && (
                            <span className="text-gray-500 text-xs block mt-1">{method.description}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Notes (Optional)</h2>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special instructions for your order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                  {cart && (
                    <>
                      <div className="space-y-3 mb-4">
                        {cart.items.map((item) => (
                          <div key={item.productId} className="flex items-start space-x-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">{formatPrice(item.lineTotal)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatPrice(cart.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>VAT (12.5%)</span>
                          <span>{formatPrice(cart.tax)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>{formatPrice(cart.total)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={processing || redirectingToPayment}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {redirectingToPayment
                      ? "Redirecting to Payment..."
                      : processing
                      ? "Processing..."
                      : paymentMethod === "ONLINE" || paymentMethod === "PAYSTACK"
                      ? "Proceed to Payment"
                      : "Complete Order"}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
