"use client";

import Link from "next/link";
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";

export function EcommerceFooter() {
  const { branding } = useBranding();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">{branding.companyName || "The POOLSHOP"}</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {branding.description || "Your one-stop shop for premium pool products, accessories, and expert solutions"}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-white transition text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/shop/cart" className="text-gray-400 hover:text-white transition text-sm">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/shop/account" className="text-gray-400 hover:text-white transition text-sm">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/shop/checkout" className="text-gray-400 hover:text-white transition text-sm">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop/about" className="text-gray-400 hover:text-white transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/shop/contact" className="text-gray-400 hover:text-white transition text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shop/shipping" className="text-gray-400 hover:text-white transition text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/shop/returns" className="text-gray-400 hover:text-white transition text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/shop/faq" className="text-gray-400 hover:text-white transition text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  123 Pool Street<br />
                  Accra, Ghana
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a href="tel:+233123456789" className="text-gray-400 hover:text-white transition text-sm">
                  +233 123 456 789
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@thepoolshop.africa" className="text-gray-400 hover:text-white transition text-sm">
                  info@thepoolshop.africa
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} {branding.companyName || "The POOLSHOP"}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/shop/privacy" className="text-gray-400 hover:text-white transition text-sm">
                Privacy Policy
              </Link>
              <Link href="/shop/terms" className="text-gray-400 hover:text-white transition text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

