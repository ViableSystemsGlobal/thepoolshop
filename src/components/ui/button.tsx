import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"

// Helper function to get theme-based button classes
const getThemeButtonClasses = (theme: any) => {
  // Add safety check for undefined theme
  if (!theme || !theme.primary) {
    return 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-200';
  }
  
  const colorMap: { [key: string]: string } = {
    'purple-600': 'bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-200',
    'blue-600': 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-200',
    'green-600': 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-200',
    'orange-600': 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-200',
    'red-600': 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-200',
    'indigo-600': 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-200',
    'pink-600': 'bg-pink-600 hover:bg-pink-700 focus-visible:ring-pink-200',
    'teal-600': 'bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-200',
    'cyan-600': 'bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-200',
    'lime-600': 'bg-lime-600 hover:bg-lime-700 focus-visible:ring-lime-200',
    'amber-600': 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-200',
    'emerald-600': 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-200',
    'violet-600': 'bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-200',
    'fuchsia-600': 'bg-fuchsia-600 hover:bg-fuchsia-700 focus-visible:ring-fuchsia-200',
    'rose-600': 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-200',
    'sky-600': 'bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-200',
    'slate-600': 'bg-slate-600 hover:bg-slate-700 focus-visible:ring-slate-200',
    'gray-600': 'bg-gray-600 hover:bg-gray-700 focus-visible:ring-gray-200',
    'zinc-600': 'bg-zinc-600 hover:bg-zinc-700 focus-visible:ring-zinc-200',
    'neutral-600': 'bg-neutral-600 hover:bg-neutral-700 focus-visible:ring-neutral-200',
    'stone-600': 'bg-stone-600 hover:bg-stone-700 focus-visible:ring-stone-200',
  };
  
  return colorMap[theme.primary] || 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-200';
};

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-white shadow-sm hover:shadow-md",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
        outline:
          "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 shadow-sm hover:shadow-md",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm hover:shadow-md",
        ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { getThemeClasses } = useTheme()
    const Comp = asChild ? Slot : "button"
    
    // Get theme classes
    const themeClasses = getThemeClasses()
    
    // Get theme-based classes for default variant with safety checks
    const buttonThemeClasses = variant === "default" ? getThemeButtonClasses(themeClasses) : ""
    const linkClasses = variant === "link" 
      ? `text-${themeClasses.primary} hover:text-${themeClasses.primaryDark}` 
      : ""
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          buttonThemeClasses,
          linkClasses
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }