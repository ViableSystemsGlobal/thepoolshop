import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ea580c", // Orange-600
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#111827", // Gray-900
        },
        destructive: {
          DEFAULT: "#ef4444", // Red-500
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f9fafb", // Gray-50
          foreground: "#6b7280", // Gray-500
        },
        accent: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#111827", // Gray-900
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111827", // Gray-900
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827", // Gray-900
        },
        border: "#e5e7eb", // Gray-200
        input: "#e5e7eb", // Gray-200
        ring: "#ea580c", // Orange-600
        background: "#ffffff",
        foreground: "#111827", // Gray-900
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;