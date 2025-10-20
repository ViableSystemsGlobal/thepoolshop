"use client"

import { signIn, getSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"

interface CompanySettings {
  companyName: string;
  companyLogo: string;
  primaryColor: string;
}

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { getThemeColor } = useTheme()
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: "AdPools Group",
    companyLogo: "",
    primaryColor: getThemeColor()
  })

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        console.log('Fetching company settings...')
        const response = await fetch('/api/public/branding')
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Company settings data:', data)
          setCompanySettings({
            companyName: data.companyName || "AdPools Group",
            companyLogo: data.companyLogo || "",
            primaryColor: getThemeColor()
          })
          console.log('Updated company settings:', {
            companyName: data.companyName || "AdPools Group",
            companyLogo: data.companyLogo || "",
            primaryColor: getThemeColor()
          })
        }
      } catch (error) {
        console.error('Error fetching company settings:', error)
      }
    }
    
    fetchCompanySettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        window.location.href = "/dashboard"
      } else {
        alert("Invalid credentials")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            {companySettings.companyLogo ? (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src={companySettings.companyLogo}
                  alt="Company Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div 
                className="w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${getThemeColor()}, ${getThemeColor()}dd)`
                }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {companySettings.companyName}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your sales management system
          </p>
        </div>

        {/* Sign In Form */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-11 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 hover:opacity-90 text-white font-medium" 
                style={{ backgroundColor: getThemeColor() }}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2025 {companySettings.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}