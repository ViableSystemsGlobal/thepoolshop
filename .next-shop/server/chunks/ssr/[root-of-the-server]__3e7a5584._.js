module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/adpoolsgroup/src/components/providers/session-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthSessionProvider",
    ()=>AuthSessionProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
"use client";
;
;
function AuthSessionProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SessionProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/providers/session-provider.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/contexts/branding-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BrandingProvider",
    ()=>BrandingProvider,
    "useBranding",
    ()=>useBranding
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const BrandingContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Default branding settings
const defaultBranding = {
    companyName: 'AdPools Group',
    companyLogo: '',
    favicon: '/uploads/branding/favicon_1760896671527.jpg',
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    description: 'A practical, single-tenant system for sales and distribution management',
    chatButtonImage: ''
};
// Convert hex color to Tailwind classes
function hexToTailwindClasses(hexColor) {
    // Map common hex colors to Tailwind classes
    const colorMap = {
        '#dc2626': 'red-600',
        '#b91c1c': 'red-700',
        '#8B5CF6': 'purple-600',
        '#7C3AED': 'purple-700',
        '#2563eb': 'blue-600',
        '#1d4ed8': 'blue-700',
        '#16a34a': 'green-600',
        '#15803d': 'green-700',
        '#ea580c': 'orange-600',
        '#c2410c': 'orange-700',
        '#4f46e5': 'indigo-600',
        '#4338ca': 'indigo-700',
        '#db2777': 'pink-600',
        '#be185d': 'pink-700',
        '#0d9488': 'teal-600',
        '#0f766e': 'teal-700'
    };
    // If it's a mapped color, use Tailwind classes
    if (colorMap[hexColor]) {
        const primaryClass = colorMap[hexColor];
        const primaryLight = primaryClass.replace('-600', '-500').replace('-700', '-600');
        const primaryDark = primaryClass.replace('-600', '-700').replace('-500', '-700');
        const primaryBg = primaryClass.replace('-600', '-50').replace('-700', '-50');
        const primaryHover = primaryClass.replace('-600', '-100').replace('-700', '-100');
        const primaryText = primaryClass.replace('-600', '-700').replace('-500', '-700');
        const primaryBorder = primaryClass.replace('-700', '-600').replace('-500', '-600');
        return {
            primary: primaryClass,
            primaryLight,
            primaryDark,
            primaryBg,
            primaryHover,
            primaryText,
            primaryBorder
        };
    }
    // For custom colors, return hex values that will be used with inline styles
    // We'll generate approximate Tailwind-like variants
    const primaryClass = hexColor;
    return {
        primary: primaryClass,
        primaryLight: adjustHexBrightness(hexColor, 10),
        primaryDark: adjustHexBrightness(hexColor, -10),
        primaryBg: hexToRgba(hexColor, 0.1),
        primaryHover: hexToRgba(hexColor, 0.2),
        primaryText: hexColor,
        primaryBorder: hexColor
    };
}
// Helper to adjust hex brightness
function adjustHexBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
// Helper to convert hex to rgba
function hexToRgba(hex, alpha) {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = num >> 16;
    const G = num >> 8 & 0x00FF;
    const B = num & 0x0000FF;
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
}
function BrandingProvider({ children }) {
    const [branding, setBranding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultBranding);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchBranding = async ()=>{
        try {
            const response = await fetch('/api/public/branding');
            if (response.ok) {
                const data = await response.json();
                setBranding(data);
                // Update document title
                if (typeof document !== 'undefined') {
                    document.title = data.companyName || 'AdPools Group';
                }
                // Update favicon
                if (typeof document !== 'undefined' && data.favicon) {
                    const favicon = document.querySelector('link[rel="icon"]');
                    if (favicon) {
                        favicon.href = data.favicon;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch branding settings:', error);
        // Keep default branding on error
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchBranding();
    }, []);
    const getThemeColor = ()=>{
        return branding.primaryColor;
    };
    const getThemeClasses = ()=>{
        return hexToTailwindClasses(branding.primaryColor);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BrandingContext.Provider, {
        value: {
            branding,
            loading,
            refreshBranding: fetchBranding,
            getThemeColor,
            getThemeClasses
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/contexts/branding-context.tsx",
        lineNumber: 166,
        columnNumber: 5
    }, this);
}
function useBranding() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(BrandingContext);
    if (context === undefined) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
}
}),
"[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$branding$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/branding-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const themeConfig = {
    purple: {
        primary: 'purple-600',
        primaryLight: 'purple-500',
        primaryDark: 'purple-700',
        primaryBg: 'purple-50',
        primaryHover: 'purple-100',
        primaryText: 'purple-700',
        primaryBorder: 'purple-600'
    },
    blue: {
        primary: 'blue-600',
        primaryLight: 'blue-500',
        primaryDark: 'blue-700',
        primaryBg: 'blue-50',
        primaryHover: 'blue-100',
        primaryText: 'blue-700',
        primaryBorder: 'blue-600'
    },
    green: {
        primary: 'green-600',
        primaryLight: 'green-500',
        primaryDark: 'green-700',
        primaryBg: 'green-50',
        primaryHover: 'green-100',
        primaryText: 'green-700',
        primaryBorder: 'green-600'
    },
    orange: {
        primary: 'orange-600',
        primaryLight: 'orange-500',
        primaryDark: 'orange-700',
        primaryBg: 'orange-50',
        primaryHover: 'orange-100',
        primaryText: 'orange-700',
        primaryBorder: 'orange-600'
    },
    red: {
        primary: 'red-600',
        primaryLight: 'red-500',
        primaryDark: 'red-700',
        primaryBg: 'red-50',
        primaryHover: 'red-100',
        primaryText: 'red-700',
        primaryBorder: 'red-600'
    },
    indigo: {
        primary: 'indigo-600',
        primaryLight: 'indigo-500',
        primaryDark: 'indigo-700',
        primaryBg: 'indigo-50',
        primaryHover: 'indigo-100',
        primaryText: 'indigo-700',
        primaryBorder: 'indigo-600'
    },
    pink: {
        primary: 'pink-600',
        primaryLight: 'pink-500',
        primaryDark: 'pink-700',
        primaryBg: 'pink-50',
        primaryHover: 'pink-100',
        primaryText: 'pink-700',
        primaryBorder: 'pink-600'
    },
    teal: {
        primary: 'teal-600',
        primaryLight: 'teal-500',
        primaryDark: 'teal-700',
        primaryBg: 'teal-50',
        primaryHover: 'teal-100',
        primaryText: 'teal-700',
        primaryBorder: 'teal-600'
    }
};
// Hex color values for charts and other uses
const themeColorValues = {
    purple: '#9333ea',
    blue: '#2563eb',
    green: '#16a34a',
    orange: '#ea580c',
    red: '#dc2626',
    indigo: '#4f46e5',
    pink: '#db2777',
    teal: '#0d9488'
};
function ThemeProvider({ children }) {
    const [themeColor, setThemeColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('red');
    const [customLogo, setCustomLogo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const branding = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$branding$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBranding"])();
    // Load theme and logo from branding context (system-wide settings)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Always use branding settings for system-wide consistency
        if (branding.branding.companyLogo) {
            setCustomLogo(branding.branding.companyLogo);
        }
        // Set theme color based on branding primary color
        if (branding.branding.primaryColor) {
            const hexColor = branding.branding.primaryColor.toLowerCase();
            // Check if it's a custom color (not a preset)
            const presetColorMap = {
                '#dc2626': 'red',
                '#b91c1c': 'red',
                '#9333ea': 'purple',
                '#7c3aed': 'purple',
                '#2563eb': 'blue',
                '#1d4ed8': 'blue',
                '#16a34a': 'green',
                '#15803d': 'green',
                '#ea580c': 'orange',
                '#c2410c': 'orange',
                '#4f46e5': 'indigo',
                '#4338ca': 'indigo',
                '#db2777': 'pink',
                '#be185d': 'pink',
                '#0d9488': 'teal',
                '#0f766e': 'teal'
            };
            // If it's a preset color, use the mapped theme color
            // Otherwise, default to 'red' but keep the hex value in branding
            if (presetColorMap[hexColor]) {
                setThemeColor(presetColorMap[hexColor]);
            } else {
                // Custom color - use red as default theme but branding will use the hex value
                setThemeColor('red');
            }
        }
    }, [
        branding.branding.companyLogo,
        branding.branding.primaryColor
    ]);
    // Save theme to localStorage when it changes
    const handleSetThemeColor = (color)=>{
        setThemeColor(color);
        localStorage.setItem('themeColor', color);
    };
    // Save logo to localStorage when it changes
    const handleSetCustomLogo = (logo)=>{
        setCustomLogo(logo);
        if (logo) {
            localStorage.setItem('customLogo', logo);
        } else {
            localStorage.removeItem('customLogo');
        }
    };
    const getThemeClasses = ()=>{
        // Use branding context for consistent theming across all users
        return branding.getThemeClasses();
    };
    const getThemeColor = ()=>{
        // Always use branding color for system-wide consistency
        return branding.branding.primaryColor || '#dc2626'; // Default to red
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: {
            themeColor,
            setThemeColor: handleSetThemeColor,
            getThemeClasses,
            getThemeColor,
            customLogo,
            setCustomLogo: handleSetCustomLogo
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx",
        lineNumber: 188,
        columnNumber: 5
    }, this);
}
function useTheme() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
}),
"[project]/Desktop/adpoolsgroup/src/contexts/toast-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ToastProvider({ children }) {
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const addToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((toast)=>{
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = {
            ...toast,
            id,
            duration: toast.duration || 5000
        };
        setToasts((prev)=>[
                ...prev,
                newToast
            ]);
        // Auto remove toast after duration
        if (newToast.duration > 0) {
            setTimeout(()=>{
                removeToast(id);
            }, newToast.duration);
        }
    }, []);
    const removeToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setToasts((prev)=>prev.filter((toast)=>toast.id !== id));
    }, []);
    const success = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((title, description)=>{
        addToast({
            type: 'success',
            title,
            description
        });
    }, [
        addToast
    ]);
    const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((title, description)=>{
        addToast({
            type: 'error',
            title,
            description
        });
    }, [
        addToast
    ]);
    const warning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((title, description)=>{
        addToast({
            type: 'warning',
            title,
            description
        });
    }, [
        addToast
    ]);
    const info = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((title, description)=>{
        addToast({
            type: 'info',
            title,
            description
        });
    }, [
        addToast
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            toasts,
            addToast,
            removeToast,
            success,
            error,
            warning,
            info
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/contexts/toast-context.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
function useToast() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
}),
"[project]/Desktop/adpoolsgroup/src/contexts/loading-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingProvider",
    ()=>LoadingProvider,
    "useLoading",
    ()=>useLoading
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const LoadingContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function LoadingProvider({ children }) {
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const setLoading = (loading)=>{
        setIsLoading(loading);
    };
    const startLoading = ()=>{
        setIsLoading(true);
    };
    const stopLoading = ()=>{
        setIsLoading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingContext.Provider, {
        value: {
            isLoading,
            setLoading,
            startLoading,
            stopLoading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/contexts/loading-context.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
function useLoading() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}
}),
"[project]/Desktop/adpoolsgroup/src/contexts/company-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompanyProvider",
    ()=>CompanyProvider,
    "useCompany",
    ()=>useCompany
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const CompanyContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function CompanyProvider({ children }) {
    const [companyName, setCompanyName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('AdPools Group');
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('A practical, single-tenant system for sales and distribution management');
    const [favicon, setFavicon] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchCompanyData = async ()=>{
        try {
            setIsLoading(true);
            const response = await fetch('/api/settings/company');
            if (response.ok) {
                const data = await response.json();
                setCompanyName(data.companyName || 'AdPools Group');
                setDescription(data.description || 'A practical, single-tenant system for sales and distribution management');
                setFavicon(data.favicon || '');
            }
        } catch (error) {
            console.error('Error fetching company data:', error);
        } finally{
            setIsLoading(false);
        }
    };
    const refreshCompanyData = async ()=>{
        await fetchCompanyData();
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchCompanyData();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompanyContext.Provider, {
        value: {
            companyName,
            description,
            favicon,
            isLoading,
            refreshCompanyData
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/contexts/company-context.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
function useCompany() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/Desktop/adpoolsgroup/src/lib/prisma.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/Desktop/adpoolsgroup/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "getSettingValue",
    ()=>getSettingValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/prisma.ts [app-ssr] (ecmascript)");
;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
async function getSettingValue(key, defaultValue = '') {
    try {
        const setting = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prisma"].systemSettings.findUnique({
            where: {
                key
            }
        });
        return setting?.value || process.env[key] || defaultValue;
    } catch (error) {
        return process.env[key] || defaultValue;
    }
}
function formatCurrency(amount, currency = 'USD') {
    // Special handling for GHS (Ghana Cedis) to display as GH₵
    if (currency === 'GHS') {
        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
        return `GH₵${formatted}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
function formatDate(date, format = 'MMM DD, YYYY') {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }
    // For datetime-local input format (YYYY-MM-DDTHH:MM)
    if (format === 'YYYY-MM-DDTHH:MM') {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    // Default format: MMM DD, YYYY (e.g., Jan 15, 2024)
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    // Add time if requested
    if (format.includes('HH:MM')) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Intl.DateTimeFormat('en-US', options).format(d);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastComponent",
    ()=>ToastComponent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/info.js [app-ssr] (ecmascript) <export default as Info>");
"use client";
;
;
;
function ToastComponent({ toast, onDismiss, theme }) {
    const icons = {
        success: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"],
        error: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
        warning: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"],
        info: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"]
    };
    const Icon = icons[toast.type];
    const getToastStyles = ()=>{
        if (theme) {
            return {
                success: {
                    bg: `bg-green-50`,
                    border: `border-green-200`,
                    icon: `text-green-600`,
                    title: `text-green-900`,
                    description: `text-green-700`
                },
                error: {
                    bg: `bg-red-50`,
                    border: `border-red-200`,
                    icon: `text-red-600`,
                    title: `text-red-900`,
                    description: `text-red-700`
                },
                warning: {
                    bg: `bg-yellow-50`,
                    border: `border-yellow-200`,
                    icon: `text-yellow-600`,
                    title: `text-yellow-900`,
                    description: `text-yellow-700`
                },
                info: {
                    bg: `bg-${theme.primaryBg}`,
                    border: `border-${theme.primaryBorder}`,
                    icon: `text-${theme.primary}`,
                    title: `text-${theme.primaryText}`,
                    description: `text-${theme.primaryText}`
                }
            };
        }
        // Fallback styles without theme
        return {
            success: {
                bg: `bg-green-50`,
                border: `border-green-200`,
                icon: `text-green-600`,
                title: `text-green-900`,
                description: `text-green-700`
            },
            error: {
                bg: `bg-red-50`,
                border: `border-red-200`,
                icon: `text-red-600`,
                title: `text-red-900`,
                description: `text-red-700`
            },
            warning: {
                bg: `bg-yellow-50`,
                border: `border-yellow-200`,
                icon: `text-yellow-600`,
                title: `text-yellow-900`,
                description: `text-yellow-700`
            },
            info: {
                bg: `bg-blue-50`,
                border: `border-blue-200`,
                icon: `text-blue-600`,
                title: `text-blue-900`,
                description: `text-blue-700`
            }
        };
    };
    const allStyles = getToastStyles();
    const styles = allStyles[toast.type] || allStyles.info; // Fallback to info if type unknown
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full items-center space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out", styles.bg, styles.border, "animate-in slide-in-from-right-full"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("h-5 w-5 flex-shrink-0", styles.icon)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    toast.title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm font-medium", styles.title),
                        children: toast.title
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    toast.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm", styles.description),
                        children: toast.description
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onDismiss(toast.id),
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5", styles.icon),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/ui/toaster.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/ui/toast.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function Toaster({ toasts, onDismiss }) {
    const { getThemeClasses } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const theme = getThemeClasses();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-4 right-4 z-50 flex flex-col space-y-2 w-96 max-w-sm",
        children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastComponent"], {
                toast: toast,
                onDismiss: onDismiss,
                theme: theme
            }, toast.id, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toaster.tsx",
                lineNumber: 19,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/toaster.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/toast-container.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastContainer",
    ()=>ToastContainer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$toaster$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/ui/toaster.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$toast$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/toast-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function ToastContainer() {
    const { toasts, removeToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$toast$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$toaster$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
        toasts: toasts,
        onDismiss: removeToast
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/toast-container.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/hydration-boundary.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HydrationBoundary",
    ()=>HydrationBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function HydrationBoundary({ children }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Suppress hydration warnings for browser extension attributes
        const originalError = console.error;
        console.error = (...args)=>{
            if (typeof args[0] === 'string' && args[0].includes('Warning: Extra attributes from the server')) {
                return;
            }
            originalError.apply(console, args);
        };
        return ()=>{
            console.error = originalError;
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/task-notification-starter.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TaskNotificationStarter",
    ()=>TaskNotificationStarter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
'use client';
;
;
function TaskNotificationStarter() {
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Only start for authenticated admin users
        if (status === 'loading') return;
        if (!session?.user || session.user.role !== 'ADMIN') return;
        let mounted = true;
        const startNotificationRunner = async ()=>{
            try {
                // Check if already running
                const statusResponse = await fetch('/api/tasks/notification-runner');
                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    if (statusData.isActive) {
                        console.log('Task notification runner is already active');
                        return;
                    }
                }
                // Start the runner
                const response = await fetch('/api/tasks/notification-runner', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'start'
                    })
                });
                if (response.ok && mounted) {
                    console.log('✅ Task notification runner started automatically');
                }
            } catch (error) {
                console.error('Failed to start task notification runner:', error);
            }
        };
        // Start after a short delay to ensure everything is loaded
        const timer = setTimeout(startNotificationRunner, 2000);
        return ()=>{
            mounted = false;
            clearTimeout(timer);
        };
    }, [
        session,
        status
    ]);
    return null; // This component doesn't render anything
}
}),
"[project]/Desktop/adpoolsgroup/src/components/dynamic-favicon.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DynamicFavicon",
    ()=>DynamicFavicon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$company$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/company-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function DynamicFavicon() {
    const { companyName, favicon } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$company$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCompany"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Update document title with company name
        if (companyName && companyName !== 'AdPools Group') {
            const originalTitle = document.title;
            const baseTitle = originalTitle.includes(' - ') ? originalTitle.split(' - ').slice(1).join(' - ') : originalTitle;
            document.title = `${companyName} - ${baseTitle}`;
        }
        // Update favicon using a safer approach
        if (favicon) {
            // Use a more React-friendly approach by updating the existing favicon
            const existingFavicon = document.querySelector('link[rel="icon"]');
            if (existingFavicon) {
                // Just update the href with cache-busting parameter
                existingFavicon.href = `${favicon}?v=${Date.now()}`;
            } else {
                // Only create new favicon if none exists
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/x-icon';
                link.href = `${favicon}?v=${Date.now()}`;
                document.head.appendChild(link);
            }
        }
    }, [
        companyName,
        favicon
    ]);
    // This component doesn't render anything visible
    return null;
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Desktop/adpoolsgroup/src/lib/permissions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized Permissions Configuration
 * 
 * This file contains the single source of truth for all permissions in the system.
 * Any changes to permissions should be made here and will automatically apply
 * to both client-side and server-side permission checks.
 */ // Define all possible abilities in the system
__turbopack_context__.s([
    "ABILITIES",
    ()=>ABILITIES,
    "MODULE_ACCESS",
    ()=>MODULE_ACCESS,
    "ROLE_ABILITIES",
    ()=>ROLE_ABILITIES,
    "canAccessModule",
    ()=>canAccessModule,
    "getAbilitiesForRole",
    ()=>getAbilitiesForRole,
    "getRequiredAbilitiesForModule",
    ()=>getRequiredAbilitiesForModule,
    "hasAbility",
    ()=>hasAbility,
    "validatePermissions",
    ()=>validatePermissions
]);
const ABILITIES = {
    // Dashboard
    'dashboard.view': 'View dashboard',
    // Products
    'products.view': 'View products',
    'products.create': 'Create products',
    'products.edit': 'Edit products',
    'products.delete': 'Delete products',
    // Inventory
    'inventory.view': 'View inventory',
    'stock.view': 'View stock',
    'stock.create': 'Create stock',
    'stock.edit': 'Edit stock',
    'stock.delete': 'Delete stock',
    // Warehouses
    'warehouses.view': 'View warehouses',
    'warehouses.create': 'Create warehouses',
    'warehouses.edit': 'Edit warehouses',
    'warehouses.delete': 'Delete warehouses',
    // Price Lists
    'price-lists.view': 'View price lists',
    'price-lists.create': 'Create price lists',
    'price-lists.edit': 'Edit price lists',
    'price-lists.delete': 'Delete price lists',
    // CRM
    'leads.view': 'View leads',
    'leads.create': 'Create leads',
    'leads.edit': 'Edit leads',
    'leads.delete': 'Delete leads',
    'leads.manage': 'Manage leads (bulk operations)',
    'accounts.view': 'View accounts',
    'accounts.create': 'Create accounts',
    'accounts.edit': 'Edit accounts',
    'accounts.delete': 'Delete accounts',
    'opportunities.view': 'View opportunities',
    'opportunities.create': 'Create opportunities',
    'opportunities.edit': 'Edit opportunities',
    'opportunities.delete': 'Delete opportunities',
    'quotations.view': 'View quotations',
    'quotations.create': 'Create quotations',
    'quotations.edit': 'Edit quotations',
    'quotations.delete': 'Delete quotations',
    'contacts.view': 'View contacts',
    'contacts.create': 'Create contacts',
    'contacts.edit': 'Edit contacts',
    'contacts.delete': 'Delete contacts',
    // Backorders
    'backorders.view': 'View backorders',
    'backorders.create': 'Create backorders',
    'backorders.edit': 'Edit backorders',
    'backorders.delete': 'Delete backorders',
    // DRM
    'drm.view': 'View DRM',
    'distributor-leads.view': 'View distributor leads',
    'distributor-leads.create': 'Create distributor leads',
    'distributor-leads.edit': 'Edit distributor leads',
    'distributor-leads.delete': 'Delete distributor leads',
    'distributors.view': 'View distributors',
    'distributors.create': 'Create distributors',
    'distributors.edit': 'Edit distributors',
    'distributors.delete': 'Delete distributors',
    'routes-mapping.view': 'View routes mapping',
    'routes-mapping.create': 'Create routes mapping',
    'routes-mapping.edit': 'Edit routes mapping',
    'routes-mapping.delete': 'Delete routes mapping',
    'engagement.view': 'View engagement',
    'engagement.create': 'Create engagement',
    'engagement.edit': 'Edit engagement',
    'engagement.delete': 'Delete engagement',
    'drm-orders.view': 'View DRM orders',
    // Sales
    'sales.view': 'View sales',
    'orders.view': 'View orders',
    'proformas.view': 'View proformas',
    'invoices.view': 'View invoices',
    'invoices.create': 'Create invoices',
    'invoices.edit': 'Edit invoices',
    'invoices.delete': 'Delete invoices',
    'payments.view': 'View payments',
    'payments.create': 'Create payments',
    'payments.edit': 'Edit payments',
    'returns.view': 'View returns',
    'credit-notes.view': 'View credit notes',
    'credit-notes.create': 'Create credit notes',
    'credit-notes.edit': 'Edit credit notes',
    'credit-notes.delete': 'Delete credit notes',
    // Communication
    'communication.view': 'View communication',
    'templates.view': 'View templates',
    'communication-logs.view': 'View communication logs',
    'sms.view': 'View SMS',
    'sms.send': 'Send SMS',
    'sms.bulk_send': 'Bulk send SMS',
    'sms.history': 'View SMS history',
    'email.view': 'View email',
    'email.send': 'Send email',
    'email.bulk_send': 'Bulk send email',
    'email.history': 'View email history',
    // Tasks
    'tasks.view': 'View tasks',
    'tasks.create': 'Create tasks',
    'tasks.edit': 'Edit tasks',
    'tasks.delete': 'Delete tasks',
    'tasks.assign': 'Assign tasks',
    'task-templates.view': 'View task templates',
    'task-templates.create': 'Create task templates',
    'task-templates.edit': 'Edit task templates',
    'task-templates.delete': 'Delete task templates',
    'task-categories.view': 'View task categories',
    'task-categories.create': 'Create task categories',
    'task-categories.edit': 'Edit task categories',
    'task-categories.delete': 'Delete task categories',
    'recurring-tasks.view': 'View recurring tasks',
    'recurring-tasks.create': 'Create recurring tasks',
    'recurring-tasks.edit': 'Edit recurring tasks',
    'recurring-tasks.delete': 'Delete recurring tasks',
    'recurring-tasks.generate': 'Generate recurring tasks',
    // Agents
    'agents.view': 'View agents',
    'agents.create': 'Create agents',
    'agents.edit': 'Edit agents',
    'agents.delete': 'Delete agents',
    'commissions.view': 'View commissions',
    'commissions.create': 'Create commissions',
    'commissions.edit': 'Edit commissions',
    'commissions.delete': 'Delete commissions',
    // Reports
    'reports.view': 'View reports',
    // AI Analyst
    'ai_analyst.access': 'Access AI Business Analyst',
    // Settings
    'settings.view': 'View settings',
    'users.view': 'View users',
    'users.create': 'Create users',
    'users.edit': 'Edit users',
    'users.delete': 'Delete users',
    'users.manage': 'Manage users (full access)',
    'roles.view': 'View roles',
    'roles.create': 'Create roles',
    'roles.edit': 'Edit roles',
    'roles.delete': 'Delete roles',
    'roles.manage': 'Manage roles (full access)',
    'product-settings.view': 'View product settings',
    'currency-settings.view': 'View currency settings',
    'business-settings.view': 'View business settings',
    'google-maps.view': 'View Google Maps',
    'google-maps.config': 'Configure Google Maps',
    'credit-monitoring.view': 'View credit monitoring',
    'credit-monitoring.manage': 'Manage credit monitoring',
    'backup-settings.view': 'View backup settings',
    'backup-settings.manage': 'Manage backup settings',
    'system-settings.view': 'View system settings',
    'notifications.view': 'View notifications',
    'notifications.create': 'Create notifications',
    'notifications.edit': 'Edit notifications',
    'notifications.delete': 'Delete notifications',
    'notifications.config': 'Configure notifications',
    'notification-templates.view': 'View notification templates',
    'notification-templates.create': 'Create notification templates',
    'notification-templates.edit': 'Edit notification templates',
    'notification-templates.delete': 'Delete notification templates',
    'lead-sources.view': 'View lead sources',
    'lead-sources.create': 'Create lead sources',
    'lead-sources.edit': 'Edit lead sources',
    'lead-sources.delete': 'Delete lead sources',
    'ai-settings.view': 'View AI settings',
    'ai-settings.manage': 'Manage AI settings',
    // Ecommerce
    'ecommerce.view': 'View ecommerce',
    'ecommerce-orders.view': 'View ecommerce orders',
    'ecommerce-orders.create': 'Create ecommerce orders',
    'ecommerce-orders.edit': 'Edit ecommerce orders',
    'ecommerce-orders.delete': 'Delete ecommerce orders',
    'ecommerce-customers.view': 'View ecommerce customers',
    'ecommerce-customers.create': 'Create ecommerce customers',
    'ecommerce-customers.edit': 'Edit ecommerce customers',
    'ecommerce-customers.delete': 'Delete ecommerce customers',
    'ecommerce-categories.view': 'View ecommerce categories',
    'ecommerce-categories.create': 'Create ecommerce categories',
    'ecommerce-categories.edit': 'Edit ecommerce categories',
    'ecommerce-categories.delete': 'Delete ecommerce categories',
    'ecommerce-marketing.view': 'View ecommerce marketing',
    'ecommerce-marketing.create': 'Create ecommerce marketing',
    'ecommerce-marketing.edit': 'Edit ecommerce marketing',
    'ecommerce-marketing.delete': 'Delete ecommerce marketing',
    'ecommerce-settings.view': 'View ecommerce settings',
    'ecommerce-settings.manage': 'Manage ecommerce settings'
};
const MODULE_ACCESS = {
    'dashboard': [
        'dashboard.view'
    ],
    'products': [
        'products.view'
    ],
    'inventory': [
        'inventory.view'
    ],
    'warehouses': [
        'warehouses.view'
    ],
    'price-lists': [
        'price-lists.view'
    ],
    'crm': [
        'leads.view',
        'accounts.view',
        'opportunities.view'
    ],
    'leads': [
        'leads.view'
    ],
    'accounts': [
        'accounts.view'
    ],
    'opportunities': [
        'opportunities.view'
    ],
    'quotations': [
        'quotations.view'
    ],
    'contacts': [
        'contacts.view'
    ],
    'backorders': [
        'backorders.view'
    ],
    'drm': [
        'drm.view'
    ],
    'distributor-leads': [
        'distributor-leads.view'
    ],
    'distributors': [
        'distributors.view'
    ],
    'routes-mapping': [
        'routes-mapping.view'
    ],
    'engagement': [
        'engagement.view'
    ],
    'drm-orders': [
        'drm-orders.view'
    ],
    'sales': [
        'sales.view'
    ],
    'orders': [
        'orders.view'
    ],
    'proformas': [
        'proformas.view'
    ],
    'invoices': [
        'invoices.view'
    ],
    'payments': [
        'payments.view'
    ],
    'returns': [
        'returns.view'
    ],
    'credit-notes': [
        'credit-notes.view'
    ],
    'communication': [
        'communication.view'
    ],
    'templates': [
        'templates.view'
    ],
    'communication-logs': [
        'communication-logs.view'
    ],
    'sms': [
        'sms.view'
    ],
    'sms-history': [
        'sms.view',
        'sms.history'
    ],
    'email': [
        'email.view'
    ],
    'email-history': [
        'email.view',
        'email.history'
    ],
    'tasks': [
        'tasks.view'
    ],
    'my-tasks': [
        'tasks.view'
    ],
    'recurring-tasks': [
        'recurring-tasks.view'
    ],
    'agents': [
        'agents.view'
    ],
    'commissions': [
        'commissions.view'
    ],
    'reports': [
        'reports.view'
    ],
    'ai_analyst': [
        'ai_analyst.access'
    ],
    'settings': [
        'settings.view'
    ],
    'users': [
        'users.view'
    ],
    'roles': [
        'roles.view'
    ],
    'product-settings': [
        'product-settings.view'
    ],
    'currency-settings': [
        'currency-settings.view'
    ],
    'business-settings': [
        'business-settings.view'
    ],
    'google-maps': [
        'google-maps.view'
    ],
    'credit-monitoring': [
        'credit-monitoring.view'
    ],
    'backup-settings': [
        'backup-settings.view'
    ],
    'system-settings': [
        'system-settings.view'
    ],
    'notifications': [
        'notifications.view'
    ],
    'notification-templates': [
        'notification-templates.view'
    ],
    'lead-sources': [
        'lead-sources.view'
    ],
    'ai-settings': [
        'ai-settings.view'
    ],
    'ecommerce': [
        'ecommerce.view'
    ],
    'ecommerce-orders': [
        'ecommerce-orders.view'
    ],
    'ecommerce-customers': [
        'ecommerce-customers.view'
    ],
    'ecommerce-categories': [
        'ecommerce-categories.view'
    ],
    'ecommerce-marketing': [
        'ecommerce-marketing.view'
    ],
    'ecommerce-settings': [
        'ecommerce-settings.view'
    ]
};
const ROLE_ABILITIES = {
    'SUPER_ADMIN': [
        // Dashboard
        'dashboard.view',
        // Products
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        // Inventory
        'inventory.view',
        'stock.view',
        'stock.create',
        'stock.edit',
        'stock.delete',
        // Warehouses
        'warehouses.view',
        'warehouses.create',
        'warehouses.edit',
        'warehouses.delete',
        // Price Lists
        'price-lists.view',
        'price-lists.create',
        'price-lists.edit',
        'price-lists.delete',
        // CRM
        'leads.view',
        'leads.create',
        'leads.edit',
        'leads.delete',
        'leads.manage',
        'accounts.view',
        'accounts.create',
        'accounts.edit',
        'accounts.delete',
        'opportunities.view',
        'opportunities.create',
        'opportunities.edit',
        'opportunities.delete',
        'quotations.view',
        'quotations.create',
        'quotations.edit',
        'quotations.delete',
        'contacts.view',
        'contacts.create',
        'contacts.edit',
        'contacts.delete',
        // Backorders
        'backorders.view',
        'backorders.create',
        'backorders.edit',
        'backorders.delete',
        // DRM
        'drm.view',
        'distributor-leads.view',
        'distributor-leads.create',
        'distributor-leads.edit',
        'distributor-leads.delete',
        'distributors.view',
        'distributors.create',
        'distributors.edit',
        'distributors.delete',
        'routes-mapping.view',
        'routes-mapping.create',
        'routes-mapping.edit',
        'routes-mapping.delete',
        'engagement.view',
        'engagement.create',
        'engagement.edit',
        'engagement.delete',
        'drm-orders.view',
        // Sales
        'sales.view',
        'orders.view',
        'proformas.view',
        'invoices.view',
        'invoices.create',
        'invoices.edit',
        'invoices.delete',
        'payments.view',
        'payments.create',
        'payments.edit',
        'returns.view',
        'credit-notes.view',
        'credit-notes.create',
        'credit-notes.edit',
        'credit-notes.delete',
        // Communication
        'communication.view',
        'templates.view',
        'communication-logs.view',
        'sms.view',
        'sms.send',
        'sms.bulk_send',
        'sms.history',
        'email.view',
        'email.send',
        'email.bulk_send',
        'email.history',
        // Tasks
        'tasks.view',
        'tasks.create',
        'tasks.edit',
        'tasks.delete',
        'tasks.assign',
        'task-templates.view',
        'task-templates.create',
        'task-templates.edit',
        'task-templates.delete',
        'task-categories.view',
        'task-categories.create',
        'task-categories.edit',
        'task-categories.delete',
        'recurring-tasks.view',
        'recurring-tasks.create',
        'recurring-tasks.edit',
        'recurring-tasks.delete',
        'recurring-tasks.generate',
        // Agents
        'agents.view',
        'agents.create',
        'agents.edit',
        'agents.delete',
        'commissions.view',
        'commissions.create',
        'commissions.edit',
        'commissions.delete',
        // Reports
        'reports.view',
        // AI Analyst
        'ai_analyst.access',
        // Settings
        'settings.view',
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'users.manage',
        'roles.view',
        'roles.create',
        'roles.edit',
        'roles.delete',
        'roles.manage',
        'product-settings.view',
        'currency-settings.view',
        'business-settings.view',
        'google-maps.view',
        'google-maps.config',
        'credit-monitoring.view',
        'credit-monitoring.manage',
        'backup-settings.view',
        'backup-settings.manage',
        'system-settings.view',
        'notifications.view',
        'notifications.create',
        'notifications.edit',
        'notifications.delete',
        'notifications.config',
        'notification-templates.view',
        'notification-templates.create',
        'notification-templates.edit',
        'notification-templates.delete',
        'lead-sources.view',
        'lead-sources.create',
        'lead-sources.edit',
        'lead-sources.delete',
        'ai-settings.view',
        'ai-settings.manage',
        // Ecommerce
        'ecommerce.view',
        'ecommerce-orders.view',
        'ecommerce-orders.create',
        'ecommerce-orders.edit',
        'ecommerce-orders.delete',
        'ecommerce-customers.view',
        'ecommerce-customers.create',
        'ecommerce-customers.edit',
        'ecommerce-customers.delete',
        'ecommerce-categories.view',
        'ecommerce-categories.create',
        'ecommerce-categories.edit',
        'ecommerce-categories.delete',
        'ecommerce-marketing.view',
        'ecommerce-marketing.create',
        'ecommerce-marketing.edit',
        'ecommerce-marketing.delete',
        'ecommerce-settings.view',
        'ecommerce-settings.manage'
    ],
    'ADMIN': [
        // Dashboard
        'dashboard.view',
        // Products
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        // Inventory
        'inventory.view',
        'stock.view',
        'stock.create',
        'stock.edit',
        'stock.delete',
        // Warehouses
        'warehouses.view',
        'warehouses.create',
        'warehouses.edit',
        'warehouses.delete',
        // Price Lists
        'price-lists.view',
        'price-lists.create',
        'price-lists.edit',
        'price-lists.delete',
        // CRM
        'leads.view',
        'leads.create',
        'leads.edit',
        'leads.delete',
        'leads.manage',
        'accounts.view',
        'accounts.create',
        'accounts.edit',
        'accounts.delete',
        'opportunities.view',
        'opportunities.create',
        'opportunities.edit',
        'opportunities.delete',
        'quotations.view',
        'quotations.create',
        'quotations.edit',
        'quotations.delete',
        'contacts.view',
        'contacts.create',
        'contacts.edit',
        'contacts.delete',
        // Backorders
        'backorders.view',
        'backorders.create',
        'backorders.edit',
        'backorders.delete',
        // DRM
        'drm.view',
        'distributor-leads.view',
        'distributor-leads.create',
        'distributor-leads.edit',
        'distributor-leads.delete',
        'distributors.view',
        'distributors.create',
        'distributors.edit',
        'distributors.delete',
        'routes-mapping.view',
        'routes-mapping.create',
        'routes-mapping.edit',
        'routes-mapping.delete',
        'engagement.view',
        'engagement.create',
        'engagement.edit',
        'engagement.delete',
        'drm-orders.view',
        // Sales
        'sales.view',
        'orders.view',
        'proformas.view',
        'invoices.view',
        'invoices.create',
        'invoices.edit',
        'invoices.delete',
        'payments.view',
        'payments.create',
        'payments.edit',
        'returns.view',
        'credit-notes.view',
        'credit-notes.create',
        'credit-notes.edit',
        'credit-notes.delete',
        // Communication
        'communication.view',
        'templates.view',
        'communication-logs.view',
        'sms.view',
        'sms.send',
        'sms.bulk_send',
        'sms.history',
        'email.view',
        'email.send',
        'email.bulk_send',
        'email.history',
        // Tasks
        'tasks.view',
        'tasks.create',
        'tasks.edit',
        'tasks.delete',
        'tasks.assign',
        'task-templates.view',
        'task-templates.create',
        'task-templates.edit',
        'task-templates.delete',
        'task-categories.view',
        'task-categories.create',
        'task-categories.edit',
        'task-categories.delete',
        'recurring-tasks.view',
        'recurring-tasks.create',
        'recurring-tasks.edit',
        'recurring-tasks.delete',
        'recurring-tasks.generate',
        // Agents
        'agents.view',
        'agents.create',
        'agents.edit',
        'agents.delete',
        'commissions.view',
        'commissions.create',
        'commissions.edit',
        'commissions.delete',
        // Reports
        'reports.view',
        // AI Analyst
        'ai_analyst.access',
        // Settings
        'settings.view',
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'users.manage',
        'roles.view',
        'roles.create',
        'roles.edit',
        'roles.delete',
        'roles.manage',
        'product-settings.view',
        'currency-settings.view',
        'business-settings.view',
        'google-maps.view',
        'google-maps.config',
        'credit-monitoring.view',
        'credit-monitoring.manage',
        'backup-settings.view',
        'backup-settings.manage',
        'system-settings.view',
        'notifications.view',
        'notifications.create',
        'notifications.edit',
        'notifications.delete',
        'notifications.config',
        'notification-templates.view',
        'notification-templates.create',
        'notification-templates.edit',
        'notification-templates.delete',
        'lead-sources.view',
        'lead-sources.create',
        'lead-sources.edit',
        'lead-sources.delete',
        'ai-settings.view',
        'ai-settings.manage'
    ],
    'SALES_MANAGER': [
        'dashboard.view',
        'products.view',
        'inventory.view',
        'stock.view',
        'warehouses.view',
        'price-lists.view',
        'leads.view',
        'leads.create',
        'leads.edit',
        'accounts.view',
        'accounts.create',
        'accounts.edit',
        'opportunities.view',
        'opportunities.create',
        'opportunities.edit',
        'quotations.view',
        'quotations.create',
        'quotations.edit',
        'contacts.view',
        'contacts.create',
        'contacts.edit',
        'backorders.view',
        'backorders.create',
        'drm.view',
        'distributor-leads.view',
        'distributors.view',
        'routes-mapping.view',
        'engagement.view',
        'drm-orders.view',
        'sales.view',
        'orders.view',
        'proformas.view',
        'invoices.view',
        'payments.view',
        'returns.view',
        'communication.view',
        'templates.view',
        'communication-logs.view',
        'sms.view',
        'sms.send',
        'sms.bulk_send',
        'sms.history',
        'email.view',
        'email.send',
        'email.bulk_send',
        'email.history',
        'tasks.view',
        'tasks.create',
        'tasks.edit',
        'task-templates.view',
        'task-templates.create',
        'task-templates.edit',
        'task-categories.view',
        'task-categories.create',
        'task-categories.edit',
        'recurring-tasks.view',
        'recurring-tasks.create',
        'recurring-tasks.edit',
        'agents.view',
        'commissions.view',
        'reports.view',
        'settings.view',
        'users.view'
    ],
    'SALES_REP': [
        'dashboard.view',
        'products.view',
        'inventory.view',
        'stock.view',
        'warehouses.view',
        'price-lists.view',
        'leads.view',
        'leads.create',
        'leads.edit',
        'accounts.view',
        'accounts.create',
        'accounts.edit',
        'opportunities.view',
        'opportunities.create',
        'opportunities.edit',
        'quotations.view',
        'quotations.create',
        'quotations.edit',
        'contacts.view',
        'contacts.create',
        'contacts.edit',
        'backorders.view',
        'backorders.create',
        'drm.view',
        'distributor-leads.view',
        'distributors.view',
        'routes-mapping.view',
        'engagement.view',
        'drm-orders.view',
        'sales.view',
        'orders.view',
        'proformas.view',
        'invoices.view',
        'payments.view',
        'returns.view',
        'communication.view',
        'templates.view',
        'communication-logs.view',
        'sms.view',
        'sms.send',
        'sms.bulk_send',
        'sms.history',
        'email.view',
        'email.send',
        'email.bulk_send',
        'email.history',
        'tasks.view',
        'tasks.create',
        'tasks.edit',
        'task-templates.view',
        'task-templates.create',
        'task-templates.edit',
        'task-categories.view',
        'task-categories.create',
        'task-categories.edit',
        'recurring-tasks.view',
        'recurring-tasks.create',
        'recurring-tasks.edit',
        'agents.view',
        'commissions.view',
        'reports.view',
        'settings.view',
        'users.view'
    ],
    'INVENTORY_MANAGER': [
        'dashboard.view',
        'products.view',
        'products.create',
        'products.edit',
        'inventory.view',
        'stock.view',
        'stock.create',
        'stock.edit',
        'stock.delete',
        'warehouses.view',
        'warehouses.create',
        'warehouses.edit',
        'warehouses.delete',
        'price-lists.view',
        'backorders.view',
        'backorders.create',
        'backorders.edit',
        'tasks.view',
        'tasks.create',
        'tasks.edit',
        'tasks.delete',
        'tasks.assign',
        'task-templates.view',
        'task-templates.create',
        'task-templates.edit',
        'task-templates.delete',
        'task-categories.view',
        'task-categories.create',
        'task-categories.edit',
        'task-categories.delete',
        'recurring-tasks.view',
        'recurring-tasks.create',
        'recurring-tasks.edit',
        'recurring-tasks.delete',
        'recurring-tasks.generate',
        'reports.view',
        'settings.view',
        'users.view'
    ],
    'FINANCE_OFFICER': [
        'dashboard.view',
        'products.view',
        'inventory.view',
        'stock.view',
        'warehouses.view',
        'price-lists.view',
        'accounts.view',
        'opportunities.view',
        'quotations.view',
        'contacts.view',
        'backorders.view',
        'drm.view',
        'distributor-leads.view',
        'distributors.view',
        'routes-mapping.view',
        'engagement.view',
        'drm-orders.view',
        'sales.view',
        'orders.view',
        'proformas.view',
        'invoices.view',
        'invoices.create',
        'invoices.edit',
        'payments.view',
        'payments.create',
        'payments.edit',
        'returns.view',
        'credit-notes.view',
        'credit-notes.create',
        'credit-notes.edit',
        'credit-notes.delete',
        'communication.view',
        'templates.view',
        'communication-logs.view',
        'sms.view',
        'sms.send',
        'sms.bulk_send',
        'sms.history',
        'email.view',
        'email.send',
        'email.bulk_send',
        'email.history',
        'tasks.view',
        'tasks.create',
        'tasks.edit',
        'tasks.delete',
        'tasks.assign',
        'task-templates.view',
        'task-templates.create',
        'task-templates.edit',
        'task-templates.delete',
        'task-categories.view',
        'task-categories.create',
        'task-categories.edit',
        'task-categories.delete',
        'recurring-tasks.view',
        'recurring-tasks.create',
        'recurring-tasks.edit',
        'recurring-tasks.delete',
        'recurring-tasks.generate',
        'agents.view',
        'commissions.view',
        'reports.view',
        'settings.view',
        'users.view'
    ],
    'CUSTOMER_SERVICE': [
        'dashboard.view',
        'products.view',
        'inventory.view',
        'stock.view',
        'warehouses.view',
        'price-lists.view',
        'leads.view',
        'leads.create',
        'leads.edit',
        'accounts.view',
        'accounts.create',
        'accounts.edit',
        'opportunities.view',
        'opportunities.create',
        'opportunities.edit',
        'quotations.view',
        'quotations.create',
        'quotations.edit',
        'contacts.view',
        'contacts.create',
        'contacts.edit',
        'backorders.view',
        'backorders.create',
        'drm.view',
        'distributor-leads.view',
        'distributors.view',
        'routes-mapping.view',
        'engagement.view',
        'drm-orders.view',
        'sales.view',
        'orders.view',
        'proformas.view',
        'invoices.view',
        'payments.view',
        'returns.view',
        'communication.view',
        'templates.view',
        'communication-logs.view',
        'sms.view',
        'sms.send',
        'sms.bulk_send',
        'sms.history',
        'email.view',
        'email.send',
        'email.bulk_send',
        'email.history',
        'tasks.view',
        'tasks.create',
        'tasks.edit',
        'task-templates.view',
        'task-templates.create',
        'task-templates.edit',
        'task-categories.view',
        'task-categories.create',
        'task-categories.edit',
        'recurring-tasks.view',
        'recurring-tasks.create',
        'recurring-tasks.edit',
        'agents.view',
        'commissions.view',
        'reports.view',
        'settings.view',
        'users.view'
    ],
    'VIEWER': [
        'dashboard.view',
        'products.view',
        'inventory.view',
        'stock.view',
        'warehouses.view',
        'price-lists.view',
        'leads.view',
        'accounts.view',
        'opportunities.view',
        'quotations.view',
        'contacts.view',
        'backorders.view',
        'drm.view',
        'distributor-leads.view',
        'distributors.view',
        'routes-mapping.view',
        'engagement.view',
        'drm-orders.view',
        'sales.view',
        'orders.view',
        'proformas.view',
        'invoices.view',
        'payments.view',
        'returns.view',
        'communication.view',
        'templates.view',
        'communication-logs.view',
        'sms.view',
        'sms.history',
        'email.view',
        'email.history',
        'tasks.view',
        'task-templates.view',
        'task-categories.view',
        'recurring-tasks.view',
        'agents.view',
        'commissions.view',
        'reports.view',
        'settings.view',
        'users.view'
    ]
};
function getAbilitiesForRole(role) {
    return ROLE_ABILITIES[role] || [];
}
function getRequiredAbilitiesForModule(module) {
    return MODULE_ACCESS[module] || [];
}
function canAccessModule(userAbilities, module) {
    const requiredAbilities = getRequiredAbilitiesForModule(module);
    return requiredAbilities.some((ability)=>userAbilities.includes(ability));
}
function hasAbility(userAbilities, ability) {
    return userAbilities.includes(ability);
}
function validatePermissions() {
    const errors = [];
    // Check that all abilities in MODULE_ACCESS exist in ABILITIES
    for (const [module, abilities] of Object.entries(MODULE_ACCESS)){
        for (const ability of abilities){
            if (!(ability in ABILITIES)) {
                errors.push(`Module '${module}' references non-existent ability '${ability}'`);
            }
        }
    }
    // Check that all abilities in ROLE_ABILITIES exist in ABILITIES
    for (const [role, abilities] of Object.entries(ROLE_ABILITIES)){
        for (const ability of abilities){
            if (!(ability in ABILITIES)) {
                errors.push(`Role '${role}' references non-existent ability '${ability}'`);
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
}),
"[project]/Desktop/adpoolsgroup/src/hooks/use-abilities.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAbilities",
    ()=>useAbilities
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/permissions.ts [app-ssr] (ecmascript)");
;
;
;
function useAbilities() {
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const [abilities, setAbilities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchAbilities = async ()=>{
            // Wait until session is available to avoid flashing no-permission states
            if (!session) {
                setLoading(true);
                return;
            }
            if (!session.user?.id) {
                setLoading(true);
                return;
            }
            try {
                const response = await fetch('/api/user/abilities', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('🔍 useAbilities - Fetched abilities from database:', data.abilities?.length || 0, 'abilities');
                    console.log('🔍 useAbilities - Has ai_analyst.access:', data.abilities?.includes('ai_analyst.access'));
                    console.log('🔍 useAbilities - Has agents.view:', data.abilities?.includes('agents.view'));
                    console.log('🔍 useAbilities - Has commissions.view:', data.abilities?.includes('commissions.view'));
                    setAbilities(data.abilities || []);
                } else {
                    console.error('Failed to fetch abilities:', response.status);
                    // Fallback to hardcoded abilities if API fails
                    const userRole = session.user.role;
                    const userAbilities = [
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLE_ABILITIES"][userRole] || []
                    ];
                    console.log('🔍 useAbilities - Using fallback abilities for role:', userRole, 'count:', userAbilities.length);
                    console.log('🔍 useAbilities - Fallback has ai_analyst.access:', userAbilities.includes('ai_analyst.access'));
                    console.log('🔍 useAbilities - Fallback has agents.view:', userAbilities.includes('agents.view'));
                    console.log('🔍 useAbilities - Fallback has commissions.view:', userAbilities.includes('commissions.view'));
                    setAbilities(userAbilities);
                }
            } catch (error) {
                console.error('Error fetching abilities:', error);
                // Fallback to hardcoded abilities if API fails
                const userRole = session.user.role;
                const userAbilities = [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ROLE_ABILITIES"][userRole] || []
                ];
                console.log('🔍 useAbilities - Using fallback abilities for role:', userRole, 'count:', userAbilities.length);
                console.log('🔍 useAbilities - Fallback has ai_analyst.access:', userAbilities.includes('ai_analyst.access'));
                console.log('🔍 useAbilities - Fallback has agents.view:', userAbilities.includes('agents.view'));
                console.log('🔍 useAbilities - Fallback has commissions.view:', userAbilities.includes('commissions.view'));
                setAbilities(userAbilities);
            } finally{
                setLoading(false);
            }
        };
        fetchAbilities();
    }, [
        session
    ]);
    const hasAbility = (resource, action)=>{
        const ability = `${resource}.${action}`;
        return abilities.includes(ability);
    };
    const canAccess = (module)=>{
        // While abilities are loading, don't hide navigation to avoid flicker
        if (loading) {
            return true;
        }
        const moduleAbilities = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MODULE_ACCESS"][module] || [];
        const hasAccess = moduleAbilities.some((ability)=>abilities.includes(ability));
        // Debug logging for ai_analyst and agents
        if (module === 'ai_analyst' || module === 'agents' || module === 'commissions') {
            console.log(`🔍 ${module} Access Check:`, {
                module,
                moduleAbilities,
                abilities: abilities.slice(0, 10),
                hasAccess,
                loading
            });
        }
        return hasAccess;
    };
    return {
        abilities,
        hasAbility,
        canAccess,
        loading
    };
}
}),
"[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Skeleton",
    ()=>Skeleton,
    "SkeletonCard",
    ()=>SkeletonCard,
    "SkeletonChart",
    ()=>SkeletonChart,
    "SkeletonForm",
    ()=>SkeletonForm,
    "SkeletonList",
    ()=>SkeletonList,
    "SkeletonMetricCard",
    ()=>SkeletonMetricCard,
    "SkeletonSidebar",
    ()=>SkeletonSidebar,
    "SkeletonTable",
    ()=>SkeletonTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function Skeleton({ className = '', width = '100%', height = '1rem', rounded = true }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `bg-gray-200 animate-pulse ${rounded ? 'rounded' : ''} ${className}`,
        style: {
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height
        }
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
function SkeletonCard({ className = '' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `bg-white rounded-lg p-6 shadow-sm border ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    height: "1.5rem",
                    width: "80%"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    height: "1rem",
                    width: "60%"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    height: "1rem",
                    width: "40%"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
function SkeletonTable({ rows = 5, columns = 4 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-sm border overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-50 px-6 py-3 border-b",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex space-x-4",
                    children: Array.from({
                        length: columns
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "1rem",
                            width: "20%"
                        }, i, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y",
                children: Array.from({
                    length: rows
                }).map((_, rowIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex space-x-4",
                            children: Array.from({
                                length: columns
                            }).map((_, colIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                    height: "1rem",
                                    width: "20%"
                                }, colIndex, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                    lineNumber: 61,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 59,
                            columnNumber: 13
                        }, this)
                    }, rowIndex, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
function SkeletonSidebar() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-64 bg-white border-r border-gray-200 h-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-6 space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "2rem",
                            width: "80%"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "1rem",
                            width: "60%"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-3",
                    children: Array.from({
                        length: 8
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                    height: "1.25rem",
                                    width: "1.25rem",
                                    rounded: true
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                    height: "1rem",
                                    width: "70%"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                    lineNumber: 87,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 85,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "pt-6 border-t border-gray-200",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                height: "2.5rem",
                                width: "2.5rem",
                                rounded: true
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                        height: "1rem",
                                        width: "80%"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                        height: "0.75rem",
                                        width: "60%"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
            lineNumber: 75,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
function SkeletonMetricCard() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg p-6 shadow-sm border",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    height: "1rem",
                    width: "60%"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    height: "2rem",
                    width: "40%"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center space-x-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "1rem",
                            width: "1rem",
                            rounded: true
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "0.875rem",
                            width: "30%"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 114,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
            lineNumber: 111,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
function SkeletonChart({ height = '300px' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg p-6 shadow-sm border",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                    height: "1.5rem",
                    width: "40%"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-100 rounded",
                    style: {
                        height
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-end justify-between h-full p-4",
                        children: Array.from({
                            length: 7
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                height: `${Math.random() * 60 + 20}%`,
                                width: "12%",
                                rounded: false
                            }, i, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                lineNumber: 135,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
            lineNumber: 127,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
function SkeletonList({ items = 5 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: Array.from({
            length: items
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg p-4 shadow-sm border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center space-x-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "2.5rem",
                            width: "2.5rem",
                            rounded: true
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 156,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                    height: "1rem",
                                    width: "70%"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                    lineNumber: 158,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                    height: "0.875rem",
                                    width: "50%"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                    lineNumber: 159,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "1.5rem",
                            width: "4rem"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 155,
                    columnNumber: 11
                }, this)
            }, i, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                lineNumber: 154,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
function SkeletonForm({ fields = 4 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg p-6 shadow-sm border",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-6",
            children: [
                Array.from({
                    length: fields
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                height: "1rem",
                                width: "25%"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                                height: "2.5rem",
                                width: "100%"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                                lineNumber: 177,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                        lineNumber: 175,
                        columnNumber: 11
                    }, this)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex space-x-3 pt-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "2.5rem",
                            width: "6rem"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 181,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Skeleton, {
                            height: "2.5rem",
                            width: "6rem"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                            lineNumber: 182,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
                    lineNumber: 180,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
            lineNumber: 173,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx",
        lineNumber: 172,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$hooks$2f$use$2d$abilities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/hooks/use-abilities.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/ui/skeleton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-ssr] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$handshake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Handshake$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/handshake.js [app-ssr] (ecmascript) <export default as Handshake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-ssr] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/package.js [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-ssr] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/user-check.js [app-ssr] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-ssr] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/building.js [app-ssr] (ecmascript) <export default as Building>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/warehouse.js [app-ssr] (ecmascript) <export default as Warehouse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-ssr] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-ssr] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/shield.js [app-ssr] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/smartphone.js [app-ssr] (ecmascript) <export default as Smartphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/history.js [app-ssr] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/square-check-big.js [app-ssr] (ecmascript) <export default as CheckSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/printer.js [app-ssr] (ecmascript) <export default as Printer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileDown$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/file-down.js [app-ssr] (ecmascript) <export default as FileDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/database.js [app-ssr] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/store.js [app-ssr] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/tag.js [app-ssr] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-ssr] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as Image>");
"use client";
;
;
;
;
;
;
;
;
;
;
const navigation = [
    {
        name: "Home",
        href: "/dashboard",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        badge: null,
        module: "dashboard"
    },
    {
        name: "CRM",
        href: "/crm",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
        badge: null,
        module: "crm",
        children: [
            {
                name: "Leads",
                href: "/crm/leads",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"],
                module: "leads"
            },
            {
                name: "Opportunities",
                href: "/crm/opportunities",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                module: "opportunities"
            },
            {
                name: "Accounts",
                href: "/crm/accounts",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"],
                module: "accounts"
            },
            {
                name: "Contacts",
                href: "/crm/contacts",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                module: "contacts"
            }
        ]
    },
    {
        name: "DRM",
        href: null,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$handshake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Handshake$3e$__["Handshake"],
        badge: null,
        module: "drm",
        children: [
            {
                name: "Distributor Leads",
                href: "/drm/distributor-leads",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                module: "distributor-leads"
            },
            {
                name: "Distributors",
                href: "/drm/distributors",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"],
                module: "distributors"
            },
            {
                name: "Routes & Mapping",
                href: "/drm/routes-mapping",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
                module: "routes-mapping"
            },
            {
                name: "Engagement",
                href: "/drm/engagement",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
                module: "engagement"
            }
        ]
    },
    {
        name: "Sales",
        href: "/sales",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"],
        badge: null,
        module: "sales",
        children: [
            {
                name: "Orders",
                href: "/orders",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"],
                module: "orders"
            },
            {
                name: "Quotations",
                href: "/quotations",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                module: "quotations"
            },
            {
                name: "Invoices",
                href: "/invoices",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                module: "invoices"
            },
            {
                name: "Credit Notes",
                href: "/credit-notes",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileDown$3e$__["FileDown"],
                module: "credit-notes"
            },
            {
                name: "Payments",
                href: "/payments",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
                module: "payments"
            },
            {
                name: "Returns",
                href: "/returns",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
                module: "returns"
            }
        ]
    },
    {
        name: "Inventory",
        href: "/inventory",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__["Warehouse"],
        badge: null,
        module: "inventory",
        children: [
            {
                name: "All Products",
                href: "/products",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
                module: "products"
            },
            {
                name: "Product Labels",
                href: "/products/labels",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__["Printer"],
                module: "products"
            },
            {
                name: "Price Lists",
                href: "/price-lists",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                module: "price-lists"
            },
            {
                name: "Stock Overview",
                href: "/inventory/stock",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                module: "inventory"
            },
            {
                name: "Stock Movements",
                href: "/inventory/stock-movements",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                module: "inventory"
            },
            {
                name: "Physical Count",
                href: "/inventory/stocktake",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__["CheckSquare"],
                module: "inventory"
            },
            {
                name: "Warehouses",
                href: "/warehouses",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"],
                module: "warehouses"
            },
            {
                name: "Suppliers",
                href: "/inventory/suppliers",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                module: "inventory"
            },
            {
                name: "Backorders",
                href: "/backorders",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
                module: "backorders"
            }
        ]
    },
    {
        name: "Ecommerce",
        href: null,
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"],
        badge: null,
        module: "ecommerce",
        children: [
            {
                name: "Dashboard",
                href: "/ecommerce/dashboard",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
                module: "ecommerce"
            },
            {
                name: "Orders",
                href: "/ecommerce/orders",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"],
                module: "ecommerce-orders"
            },
            {
                name: "Customers",
                href: "/ecommerce/customers",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                module: "ecommerce-customers"
            },
            {
                name: "Categories",
                href: "/ecommerce/categories",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"],
                module: "ecommerce-categories"
            },
            {
                name: "Banners",
                href: "/ecommerce/banners",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"],
                module: "ecommerce-marketing"
            },
            {
                name: "Marketing",
                href: "/ecommerce/marketing",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"],
                module: "ecommerce-marketing"
            },
            {
                name: "Settings",
                href: "/ecommerce/settings",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
                module: "ecommerce-settings"
            }
        ]
    },
    {
        name: "Communication",
        href: "/communication",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
        badge: null,
        module: "communication",
        children: [
            {
                name: "SMS Messages",
                href: "/communication/sms",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$smartphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Smartphone$3e$__["Smartphone"],
                module: "sms"
            },
            {
                name: "SMS History",
                href: "/communication/sms-history",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"],
                module: "sms-history"
            },
            {
                name: "Email Messages",
                href: "/communication/email",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"],
                module: "email"
            },
            {
                name: "Email History",
                href: "/communication/email-history",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"],
                module: "email-history"
            },
            {
                name: "Templates",
                href: "/templates",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                module: "templates"
            },
            {
                name: "Logs",
                href: "/communication-logs",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                module: "communication-logs"
            }
        ]
    },
    {
        name: "Agents",
        href: "/agents",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"],
        badge: null,
        module: "agents",
        children: [
            {
                name: "Agents",
                href: "/agents",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                module: "agents"
            },
            {
                name: "Commissions",
                href: "/commissions",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
                module: "commissions"
            }
        ]
    },
    {
        name: "Tasks",
        href: "/tasks",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__["CheckSquare"],
        badge: null,
        module: "tasks",
        children: [
            {
                name: "All Tasks",
                href: "/tasks",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__["CheckSquare"],
                module: "tasks"
            },
            {
                name: "My Tasks",
                href: "/tasks/my",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
                module: "my-tasks"
            }
        ]
    },
    {
        name: "Reports",
        href: "/reports",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        badge: null,
        module: "reports"
    },
    {
        name: "AI Business Analyst",
        href: "/ai-analyst",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        badge: null,
        module: "ai_analyst"
    },
    {
        name: "Settings",
        href: "/settings",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        badge: null,
        module: "settings",
        children: [
            {
                name: "User Management",
                href: "/settings/users",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                module: "users"
            },
            {
                name: "Role Management",
                href: "/settings/roles",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
                module: "roles"
            },
            {
                name: "Notifications",
                href: "/settings/notifications",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"],
                module: "notifications"
            },
            {
                name: "Notification Templates",
                href: "/settings/notification-templates",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                module: "notification_templates"
            },
            {
                name: "Task Templates",
                href: "/settings/task-templates",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__["CheckSquare"],
                module: "task_templates"
            },
            {
                name: "Lead Sources",
                href: "/settings/lead-sources",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"],
                module: "lead_sources"
            },
            {
                name: "Product Settings",
                href: "/settings/products",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
                module: "product-settings"
            },
            {
                name: "Currency Settings",
                href: "/settings/currency",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"],
                module: "currency-settings"
            },
            {
                name: "Business Settings",
                href: "/settings/business",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"],
                module: "business-settings"
            },
            {
                name: "Google Maps",
                href: "/settings/google-maps",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
                module: "google-maps"
            },
            {
                name: "Credit Monitoring",
                href: "/settings/credit-monitoring",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
                module: "credit-monitoring"
            },
            {
                name: "AI Settings",
                href: "/settings/ai",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                module: "ai-settings"
            },
            {
                name: "Backup & Restore",
                href: "/settings/backup",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"],
                module: "backup-settings"
            },
            {
                name: "System Settings",
                href: "/settings/system",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
                module: "system-settings"
            }
        ]
    }
];
const shortcuts = [
    {
        name: "Pending Tasks",
        href: "/tasks?status=PENDING",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__["CheckSquare"],
        badge: "0"
    },
    {
        name: "Overdue Invoices",
        href: "/invoices?status=OVERDUE&paymentStatus=UNPAID",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        badge: "0"
    },
    {
        name: "Low/No Stock",
        href: "/inventory/stock?stockStatus=low-stock",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
        badge: "0"
    }
];
function Sidebar() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [expandedSections, setExpandedSections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isInitialLoad, setIsInitialLoad] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const { getThemeClasses, customLogo, getThemeColor } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const theme = getThemeClasses();
    const { canAccess, loading: abilitiesLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$hooks$2f$use$2d$abilities$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAbilities"])();
    const { data: session, status: sessionStatus } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const [shortcutCounts, setShortcutCounts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        pendingTasks: 0,
        overdueInvoices: 0,
        lowStock: 0
    });
    // Show skeleton loading during initial load, while abilities are loading, or session is loading
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (sessionStatus !== 'loading' && !abilitiesLoading) {
            // Add a small delay to ensure skeleton shows during hard refresh
            const timer = setTimeout(()=>{
                setIsInitialLoad(false);
            }, 500);
            return ()=>clearTimeout(timer);
        }
    }, [
        sessionStatus,
        abilitiesLoading
    ]);
    // Define isActive function before using it in useEffect
    const isActive = (href)=>{
        if (pathname === href) return true;
        // Special case for /tasks routes
        if (href === "/tasks") {
            // Only match if we're exactly on /tasks, not on /tasks/my or other sub-routes
            return pathname === "/tasks";
        }
        // Special case for /products - only match exact /products, not /products/labels
        if (href === "/products") {
            return pathname === "/products";
        }
        // For other child routes, only match if it's a direct child (not a grandchild)
        if (pathname.startsWith(href + "/")) {
            const remainingPath = pathname.slice(href.length + 1);
            // Only match if there's no additional path segments (direct child)
            return !remainingPath.includes("/");
        }
        return false;
    };
    // Fetch shortcut counts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchShortcutCounts = async ()=>{
            try {
                const response = await fetch('/api/shortcuts/counts');
                if (response.ok) {
                    const data = await response.json();
                    setShortcutCounts(data);
                }
            } catch (error) {
                console.error('Error fetching shortcut counts:', error);
            }
        };
        if (sessionStatus !== 'loading') {
            fetchShortcutCounts();
        }
    }, [
        sessionStatus
    ]);
    // Auto-expand sections when on child pages
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const shouldExpandSections = [];
        navigation.forEach((section)=>{
            if (section.children) {
                const hasActiveChild = section.children.some((child)=>isActive(child.href));
                if (hasActiveChild) {
                    shouldExpandSections.push(section.name);
                }
            }
        });
        if (shouldExpandSections.length > 0) {
            setExpandedSections((prev)=>{
                const newExpanded = [
                    ...new Set([
                        ...prev,
                        ...shouldExpandSections
                    ])
                ];
                return newExpanded;
            });
        }
    }, [
        pathname
    ]);
    if (isInitialLoad || abilitiesLoading || sessionStatus === 'loading') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SkeletonSidebar"], {}, void 0, false, {
            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
            lineNumber: 308,
            columnNumber: 12
        }, this);
    }
    // Get theme color (hex value) from branding context
    const themeColorHex = getThemeColor();
    // Check if color is a custom hex color or preset Tailwind class
    const isCustomColor = theme.primary?.startsWith('#');
    // Helper function to get proper background classes or styles
    const getBackgroundClasses = (isActive, isHover = false)=>{
        if (isCustomColor) {
            // For custom colors, return empty string and use inline styles
            return '';
        }
        const prefix = isHover ? 'hover:' : '';
        const colorMap = {
            'purple-600': `${prefix}bg-purple-600`,
            'blue-600': `${prefix}bg-blue-600`,
            'green-600': `${prefix}bg-green-600`,
            'orange-600': `${prefix}bg-orange-600`,
            'red-600': `${prefix}bg-red-600`,
            'indigo-600': `${prefix}bg-indigo-600`,
            'pink-600': `${prefix}bg-pink-600`,
            'teal-600': `${prefix}bg-teal-600`
        };
        return colorMap[theme.primary] || `${prefix}bg-blue-600`;
    };
    // Helper function to get background style for custom colors
    const getBackgroundStyle = (isActive, isHover = false)=>{
        if (!isCustomColor || !isActive) return {};
        return {
            backgroundColor: themeColorHex
        };
    };
    // Helper function to get hover background classes with safelist
    const getHoverBackgroundClasses = ()=>{
        if (isCustomColor) {
            return '';
        }
        const colorMap = {
            'purple-600': 'hover:bg-purple-600',
            'blue-600': 'hover:bg-blue-600',
            'green-600': 'hover:bg-green-600',
            'orange-600': 'hover:bg-orange-600',
            'red-600': 'hover:bg-red-600',
            'indigo-600': 'hover:bg-indigo-600',
            'pink-600': 'hover:bg-pink-600',
            'teal-600': 'hover:bg-teal-600'
        };
        return colorMap[theme.primary] || 'hover:bg-blue-600';
    };
    // Helper function to get hover background style for custom colors
    const getHoverBackgroundStyle = ()=>{
        if (!isCustomColor) return {};
        return {
            '--hover-bg': themeColorHex
        };
    };
    // Helper function to get proper text color classes or styles
    const getTextColorClasses = (isHover = false)=>{
        if (isCustomColor) {
            return '';
        }
        const prefix = isHover ? 'hover:' : '';
        const colorMap = {
            'purple-600': `${prefix}text-purple-600`,
            'blue-600': `${prefix}text-blue-600`,
            'green-600': `${prefix}text-green-600`,
            'orange-600': `${prefix}text-orange-600`,
            'red-600': `${prefix}text-red-600`,
            'indigo-600': `${prefix}text-indigo-600`,
            'pink-600': `${prefix}text-pink-600`,
            'teal-600': `${prefix}text-teal-600`
        };
        return colorMap[theme.primary] || `${prefix}text-blue-600`;
    };
    // Helper function to get text color style for custom colors
    const getTextColorStyle = (isHover = false)=>{
        if (!isCustomColor) return {};
        return {
            color: themeColorHex
        };
    };
    // Helper function to get proper focus ring classes
    const getFocusRingClasses = ()=>{
        const colorMap = {
            'purple-600': 'focus:ring-purple-500',
            'blue-600': 'focus:ring-blue-500',
            'green-600': 'focus:ring-green-500',
            'orange-600': 'focus:ring-orange-500',
            'red-600': 'focus:ring-red-500',
            'indigo-600': 'focus:ring-indigo-500',
            'pink-600': 'focus:ring-pink-500',
            'teal-600': 'focus:ring-teal-500'
        };
        return colorMap[theme.primary] || 'focus:ring-blue-500';
    };
    // Helper function to get proper gradient background classes
    const getGradientBackgroundClasses = ()=>{
        const colorMap = {
            'purple-600': 'bg-gradient-to-br from-purple-600 to-purple-700',
            'blue-600': 'bg-gradient-to-br from-blue-600 to-blue-700',
            'green-600': 'bg-gradient-to-br from-green-600 to-green-700',
            'orange-600': 'bg-gradient-to-br from-orange-600 to-orange-700',
            'red-600': 'bg-gradient-to-br from-red-600 to-red-700',
            'indigo-600': 'bg-gradient-to-br from-indigo-600 to-indigo-700',
            'pink-600': 'bg-gradient-to-br from-pink-600 to-pink-700',
            'teal-600': 'bg-gradient-to-br from-teal-600 to-teal-700'
        };
        return colorMap[theme.primary] || 'bg-gradient-to-br from-blue-600 to-blue-700';
    };
    const toggleSection = (sectionName)=>{
        setExpandedSections((prev)=>prev.includes(sectionName) ? prev.filter((name)=>name !== sectionName) : [
                ...prev,
                sectionName
            ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-200", collapsed ? "w-16" : "w-64"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-20 items-center justify-center border-b border-gray-200 px-2",
                children: customLogo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: customLogo,
                    alt: "Logo",
                    className: "h-16 w-auto max-w-full rounded-lg object-contain"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                    lineNumber: 444,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `h-16 w-16 rounded-lg ${getGradientBackgroundClasses()} flex items-center justify-center shadow-lg`,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"], {
                        className: "h-9 w-9 text-white"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                        lineNumber: 451,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                    lineNumber: 450,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                lineNumber: 442,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 space-y-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400",
                children: navigation.filter((item)=>canAccess(item.module)).map((item)=>{
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedSections.includes(item.name);
                    const isActiveItem = item.href && isActive(item.href) || hasChildren && item.children.some((child)=>isActive(child.href));
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            hasChildren ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleSection(item.name),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActiveItem && !isCustomColor ? `${getBackgroundClasses(true)} text-white` : !isActiveItem && !isCustomColor ? `text-gray-700 ${getHoverBackgroundClasses()} hover:text-white` : isCustomColor && !isActiveItem ? 'text-gray-700' : ''),
                                style: isActiveItem ? getBackgroundStyle(true) : isCustomColor && !isActiveItem ? {
                                    color: '#374151'
                                } : {},
                                onMouseEnter: (e)=>{
                                    if (isCustomColor && !isActiveItem) {
                                        e.currentTarget.style.backgroundColor = themeColorHex;
                                        e.currentTarget.style.color = 'white';
                                        // Set icon to white
                                        const icon = e.currentTarget.querySelector('svg');
                                        if (icon) icon.style.color = 'white';
                                        // Set text span to white
                                        const textSpan = e.currentTarget.querySelector('span:not(.ml-auto)');
                                        if (textSpan) textSpan.style.color = 'white';
                                        // Set chevron to white
                                        const chevron = e.currentTarget.querySelector('.ml-auto svg');
                                        if (chevron) chevron.style.color = 'white';
                                        const chevronSpan = e.currentTarget.querySelector('.ml-auto');
                                        if (chevronSpan) chevronSpan.style.color = 'white';
                                    }
                                },
                                onMouseLeave: (e)=>{
                                    if (isCustomColor && !isActiveItem) {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.color = '#374151'; // Restore gray text color
                                        // Restore icon color
                                        const icon = e.currentTarget.querySelector('svg');
                                        if (icon) icon.style.color = '#374151';
                                        // Restore text span color
                                        const textSpan = e.currentTarget.querySelector('span:not(.ml-auto)');
                                        if (textSpan) textSpan.style.color = '#374151';
                                        // Restore chevron color
                                        const chevron = e.currentTarget.querySelector('.ml-auto svg');
                                        if (chevron) chevron.style.color = '#6B7280';
                                        const chevronSpan = e.currentTarget.querySelector('.ml-auto');
                                        if (chevronSpan) chevronSpan.style.color = '#6B7280';
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("mr-3 h-5 w-5 flex-shrink-0", !isCustomColor && !isActiveItem ? "group-hover:text-white" : ""),
                                        style: isActiveItem && isCustomColor ? {
                                            color: 'white'
                                        } : isCustomColor && !isActiveItem ? {
                                            color: '#374151'
                                        } : {}
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                        lineNumber: 517,
                                        columnNumber: 19
                                    }, this),
                                    !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(!isCustomColor && !isActiveItem ? "group-hover:!text-white" : ""),
                                                style: isActiveItem && isCustomColor ? {
                                                    color: 'white'
                                                } : isCustomColor && !isActiveItem ? {
                                                    color: '#374151'
                                                } : {} // No inline style for preset colors - let classes handle it
                                                ,
                                                children: item.name
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                                lineNumber: 523,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("ml-auto transition-colors", isActiveItem && isCustomColor ? "text-white" : isActiveItem ? "text-white" : "text-gray-400 group-hover:text-white"),
                                                style: isActiveItem && isCustomColor ? {
                                                    color: 'white'
                                                } : isCustomColor && !isActiveItem ? {
                                                    color: '#6B7280'
                                                } : {},
                                                children: isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                                    lineNumber: 543,
                                                    columnNumber: 39
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                                    lineNumber: 543,
                                                    columnNumber: 77
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                                lineNumber: 537,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                lineNumber: 469,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href || '#',
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left", isActiveItem && !isCustomColor ? `${getBackgroundClasses(true)} text-white` : !isActiveItem && !isCustomColor ? `text-gray-700 ${getHoverBackgroundClasses()} hover:text-white` : isCustomColor && !isActiveItem ? 'text-gray-700' : ''),
                                style: isActiveItem ? getBackgroundStyle(true) : isCustomColor && !isActiveItem ? {
                                    color: '#374151'
                                } : {},
                                onMouseEnter: (e)=>{
                                    if (isCustomColor && !isActiveItem) {
                                        e.currentTarget.style.backgroundColor = themeColorHex;
                                        e.currentTarget.style.color = 'white';
                                        // Set icon to white
                                        const icon = e.currentTarget.querySelector('svg');
                                        if (icon) icon.style.color = 'white';
                                        // Set text span to white
                                        const textSpan = e.currentTarget.querySelector('span');
                                        if (textSpan) textSpan.style.color = 'white';
                                    }
                                },
                                onMouseLeave: (e)=>{
                                    if (isCustomColor && !isActiveItem) {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.color = '#374151'; // Restore gray text color
                                        // Restore icon color
                                        const icon = e.currentTarget.querySelector('svg');
                                        if (icon) icon.style.color = '#374151';
                                        // Restore text span color
                                        const textSpan = e.currentTarget.querySelector('span');
                                        if (textSpan) textSpan.style.color = '#374151';
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("mr-3 h-5 w-5 flex-shrink-0", !isCustomColor && !isActiveItem ? "group-hover:text-white" : ""),
                                        style: isActiveItem && isCustomColor ? {
                                            color: 'white'
                                        } : isCustomColor && !isActiveItem ? {
                                            color: '#374151'
                                        } : {}
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                        lineNumber: 587,
                                        columnNumber: 19
                                    }, this),
                                    !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(!isCustomColor && !isActiveItem ? "group-hover:!text-white" : ""),
                                        style: isActiveItem && isCustomColor ? {
                                            color: 'white'
                                        } : isCustomColor && !isActiveItem ? {
                                            color: '#374151'
                                        } : {} // No inline style for preset colors - let classes handle it
                                        ,
                                        children: item.name
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                        lineNumber: 592,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                lineNumber: 549,
                                columnNumber: 17
                            }, this),
                            hasChildren && isExpanded && !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ml-6 mt-1 space-y-1",
                                children: item.children.filter((child)=>{
                                    // Special handling for Tasks module
                                    if (child.module === "tasks" || child.module === "my-tasks") {
                                        // All roles can access My Tasks
                                        if (child.module === "my-tasks") {
                                            return true;
                                        }
                                        // Only Super Admin and Admin can access All Tasks
                                        if (child.module === "tasks") {
                                            const userRole = session?.user?.role;
                                            return userRole === "SUPER_ADMIN" || userRole === "ADMIN";
                                        }
                                    }
                                    // Default access control for other modules
                                    return canAccess(child.module);
                                }).map((child)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: child.href,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left", isActive(child.href) && !isCustomColor ? getTextColorClasses() : !isActive(child.href) && !isCustomColor ? `text-gray-600 ${getTextColorClasses(true)}` : isCustomColor && !isActive(child.href) ? 'text-gray-600' : ''),
                                        style: isActive(child.href) ? getTextColorStyle() : isCustomColor && !isActive(child.href) ? {
                                            color: '#4B5563'
                                        } : {},
                                        onMouseEnter: (e)=>{
                                            if (isCustomColor && !isActive(child.href)) {
                                                e.currentTarget.style.color = themeColorHex;
                                            }
                                        },
                                        onMouseLeave: (e)=>{
                                            if (isCustomColor && !isActive(child.href)) {
                                                e.currentTarget.style.color = '#4B5563';
                                            }
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(child.icon, {
                                                className: "mr-3 h-4 w-4 flex-shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                                lineNumber: 656,
                                                columnNumber: 23
                                            }, this),
                                            child.name
                                        ]
                                    }, child.name, true, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                        lineNumber: 631,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                lineNumber: 612,
                                columnNumber: 17
                            }, this)
                        ]
                    }, item.name, true, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                        lineNumber: 467,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                lineNumber: 458,
                columnNumber: 7
            }, this),
            !collapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs font-medium text-gray-500 uppercase tracking-wider mb-2",
                        children: "Shortcuts"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                        lineNumber: 670,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: shortcuts.map((shortcut, index)=>{
                            const Icon = shortcut.icon;
                            const themeColor = getThemeColor();
                            // Map badge count based on shortcut name
                            let badgeCount = 0;
                            if (shortcut.name === 'Pending Tasks') badgeCount = shortcutCounts.pendingTasks;
                            else if (shortcut.name === 'Overdue Invoices') badgeCount = shortcutCounts.overdueInvoices;
                            else if (shortcut.name === 'Low/No Stock') badgeCount = shortcutCounts.lowStock;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: shortcut.href,
                                className: "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors",
                                style: {
                                    backgroundColor: 'transparent'
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.backgroundColor = `${themeColor}15`; // 15 = ~8% opacity
                                    e.currentTarget.style.color = themeColor;
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#374151'; // text-gray-700
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                className: "mr-3 h-4 w-4 flex-shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                                lineNumber: 701,
                                                columnNumber: 21
                                            }, this),
                                            shortcut.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                        lineNumber: 700,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white",
                                        style: {
                                            backgroundColor: themeColor
                                        },
                                        children: badgeCount
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                        lineNumber: 704,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, shortcut.name, true, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                lineNumber: 684,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                        lineNumber: 673,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                lineNumber: 669,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-gray-200 p-4",
                children: !collapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-3 mb-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-8 w-8 rounded-full flex items-center justify-center",
                                    style: {
                                        background: `linear-gradient(to bottom right, ${getThemeColor()}, ${getThemeColor()}dd)`
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white text-sm font-medium",
                                        children: session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'U'
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                        lineNumber: 729,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                    lineNumber: 723,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-gray-900 truncate",
                                            children: session?.user?.name || 'User'
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                            lineNumber: 734,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-500 truncate",
                                            children: session?.user?.email || 'user@example.com'
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                            lineNumber: 737,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                    lineNumber: 733,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                            lineNumber: 722,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "flex items-center w-full text-sm text-gray-500 transition-colors",
                            style: {
                                color: '#6b7280'
                            },
                            onMouseEnter: (e)=>{
                                e.currentTarget.style.color = getThemeColor();
                            },
                            onMouseLeave: (e)=>{
                                e.currentTarget.style.color = '#6b7280';
                            },
                            onClick: ()=>{
                                // Could open a help modal or navigate to help page
                                alert('Help & Keyboard shortcuts coming soon!');
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                    className: "mr-2 h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                    lineNumber: 758,
                                    columnNumber: 15
                                }, this),
                                "Help & Keyboard shortcuts"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                            lineNumber: 744,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-8 w-8 rounded-full flex items-center justify-center",
                            style: {
                                background: `linear-gradient(to bottom right, ${getThemeColor()}, ${getThemeColor()}dd)`
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white text-sm font-medium",
                                children: session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'U'
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                lineNumber: 770,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                            lineNumber: 764,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "text-gray-500 transition-colors",
                            onMouseEnter: (e)=>{
                                e.currentTarget.style.color = getThemeColor();
                            },
                            onMouseLeave: (e)=>{
                                e.currentTarget.style.color = '#6b7280';
                            },
                            onClick: ()=>{
                                alert('Help & Keyboard shortcuts coming soon!');
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                                lineNumber: 786,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                            lineNumber: 774,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                    lineNumber: 763,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                lineNumber: 718,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-gray-200 p-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setCollapsed(!collapsed),
                    className: "w-full rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors",
                    title: collapsed ? "Expand sidebar" : "Collapse sidebar",
                    children: collapsed ? "▶" : "◀"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                    lineNumber: 794,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
                lineNumber: 793,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx",
        lineNumber: 437,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
// Helper function to get theme-based button classes
const getThemeButtonClasses = (theme)=>{
    // Add safety check for undefined theme
    if (!theme || !theme.primary) {
        return 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-200';
    }
    const colorMap = {
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
        'stone-600': 'bg-stone-600 hover:bg-stone-700 focus-visible:ring-stone-200'
    };
    return colorMap[theme.primary] || 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-200';
};
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "text-white shadow-sm hover:shadow-md",
            destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
            outline: "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 shadow-sm hover:shadow-md",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm hover:shadow-md",
            ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
            link: "underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-lg px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, variant, size, asChild = false, ...props }, ref)=>{
    const { getThemeClasses } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    // Get theme classes
    const themeClasses = getThemeClasses();
    // Get theme-based classes for default variant with safety checks
    const buttonThemeClasses = variant === "default" ? getThemeButtonClasses(themeClasses) : "";
    const linkClasses = variant === "link" ? `text-${themeClasses.primary} hover:text-${themeClasses.primaryDark}` : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        }), buttonThemeClasses, linkClasses),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/button.tsx",
        lineNumber: 92,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Button.displayName = "Button";
;
}),
"[project]/Desktop/adpoolsgroup/src/components/ui/input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/input.tsx",
        lineNumber: 11,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Input.displayName = "Input";
;
}),
"[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-ssr] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
"use client";
;
;
;
;
;
;
;
function Header() {
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { getThemeClasses } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const theme = getThemeClasses();
    const handleSignOut = async ()=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])({
            callbackUrl: '/auth/signin',
            redirect: true
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                            className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                            placeholder: "Search anything...",
                            className: `w-80 pl-10 h-9 border-gray-200 focus:border-${theme.primary} focus:ring-${theme.primaryBg}`
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "icon",
                        className: `h-9 w-9 text-gray-500 hover:text-${theme.primary} hover:bg-${theme.primaryBg}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "icon",
                        className: `h-9 w-9 text-gray-500 hover:text-${theme.primary} hover:bg-${theme.primaryBg}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-3 pl-3 border-l border-gray-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-8 h-8 bg-gradient-to-br from-${theme.primaryLight} to-${theme.primary} rounded-full flex items-center justify-center`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                            className: "h-4 w-4 text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                            lineNumber: 47,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium text-gray-900",
                                                children: session?.user?.name || "User"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                                lineNumber: 50,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500",
                                                children: session?.user?.role || "Sales Rep"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                                lineNumber: 53,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                        lineNumber: 49,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "ghost",
                                size: "icon",
                                onClick: handleSignOut,
                                className: `h-8 w-8 text-gray-500 hover:text-${theme.primary} hover:bg-${theme.primaryBg}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                    lineNumber: 65,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingChatButton",
    ()=>FloatingChatButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$toast$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/toast-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$branding$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/branding-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function FloatingChatButton({ customBackground } = {}) {
    const { getThemeColor } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const { error: showError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$toast$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const { branding } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$branding$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBranding"])();
    const themeColor = getThemeColor();
    // Use branding chat button image if available, otherwise use customBackground prop
    const chatButtonImage = branding.chatButtonImage || customBackground;
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [chatHistory, setChatHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hasShownWelcome, setHasShownWelcome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPreview, setShowPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasDismissedPreview, setHasDismissedPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDismissing, setIsDismissing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const chatModalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Handle click outside to close
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (chatModalRef.current && !chatModalRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event)=>{
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [
        isOpen
    ]);
    // Show welcome message when chat opens for the first time
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen && !hasShownWelcome && chatHistory.length === 0) {
            setHasShownWelcome(true);
            const welcomeMessage = {
                role: 'assistant',
                content: "👋 Hi! I'm Kwame, your AI assistant.\n\nI'm here to help you navigate the system, answer questions, and make your work easier. Feel free to ask me anything!"
            };
            setChatHistory([
                welcomeMessage
            ]);
        }
    }, [
        isOpen,
        hasShownWelcome,
        chatHistory.length
    ]);
    // Check if user has previously dismissed the preview
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const dismissed = localStorage.getItem('kwame-preview-dismissed');
        const lastShown = localStorage.getItem('kwame-preview-last-shown');
        const visitCount = parseInt(localStorage.getItem('kwame-visit-count') || '0');
        // Increment visit count
        localStorage.setItem('kwame-visit-count', (visitCount + 1).toString());
        if (dismissed === 'true') {
            setHasDismissedPreview(true);
            return;
        }
        // Show preview periodically:
        // 1. User hasn't dismissed it permanently
        // 2. User has visited at least 2 times (not first visit)
        // 3. Not on mobile (less intrusive)
        // 4. Either hasn't been shown in last 7 days, or visit count is a multiple of 10
        const now = Date.now();
        const lastShownTime = lastShown ? parseInt(lastShown) : 0;
        const isMobile = window.innerWidth < 768;
        const daysSinceLastShown = (now - lastShownTime) / (24 * 60 * 60 * 1000);
        const shouldShow = visitCount >= 2 && !isMobile && (daysSinceLastShown >= 7 || visitCount % 10 === 0 && daysSinceLastShown >= 1);
        if (shouldShow) {
            const showTimer = setTimeout(()=>{
                setShowPreview(true);
                localStorage.setItem('kwame-preview-last-shown', now.toString());
            }, 3000); // Show after 3 seconds
            const hideTimer = setTimeout(()=>{
                setShowPreview(false);
            }, 10000); // Hide after 10 seconds
            return ()=>{
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, []);
    const handleSendMessage = async ()=>{
        if (!message.trim() || isLoading) return;
        const userMessage = {
            role: 'user',
            content: message
        };
        const updatedHistory = [
            ...chatHistory,
            userMessage
        ];
        setChatHistory(updatedHistory);
        setMessage("");
        setIsLoading(true);
        try {
            // Build conversation history for API (exclude welcome message)
            const welcomeMessageText = "👋 Hi! I'm Kwame, your AI assistant.\n\nI'm here to help you navigate the system, answer questions, and make your work easier. Feel free to ask me anything!";
            const conversationHistory = updatedHistory.filter((msg)=>msg.content !== welcomeMessageText).map((msg)=>({
                    role: msg.role,
                    content: msg.content
                }));
            const response = await fetch('/api/ai/kwame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: conversationHistory.slice(-10) // Last 10 messages for context
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }
            const data = await response.json();
            const aiResponse = {
                role: 'assistant',
                content: data.response?.text || "I'm sorry, I couldn't process your request. Please try again."
            };
            setChatHistory((prev)=>[
                    ...prev,
                    aiResponse
                ]);
        } catch (error) {
            console.error('Error sending message to Kwame:', error);
            const errorMessage = {
                role: 'assistant',
                content: error instanceof Error ? error.message : "I'm sorry, I encountered an error. Please try again or check your AI settings."
            };
            setChatHistory((prev)=>[
                    ...prev,
                    errorMessage
                ]);
            showError(error instanceof Error ? error.message : 'Failed to send message');
        } finally{
            setIsLoading(false);
        }
    };
    // Enhanced dismissal function with animation
    const handleDismissPreview = (permanent = true)=>{
        setIsDismissing(true);
        // Animate out
        setTimeout(()=>{
            setShowPreview(false);
            setIsDismissing(false);
            if (permanent) {
                setHasDismissedPreview(true);
                localStorage.setItem('kwame-preview-dismissed', 'true');
            }
        }, 300); // Match animation duration
    };
    // Utility function to reset preview dismissal (for development/testing)
    const resetPreviewDismissal = ()=>{
        setHasDismissedPreview(false);
        setIsDismissing(false);
        localStorage.removeItem('kwame-preview-dismissed');
        localStorage.removeItem('kwame-preview-last-shown');
        localStorage.removeItem('kwame-visit-count');
    };
    // Expose reset function to window for debugging
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        window.resetKwamePreview = resetPreviewDismissal;
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            showPreview && !isOpen && !hasDismissedPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed bottom-24 right-6 z-50 transition-all duration-300 ${isDismissing ? 'animate-out slide-out-to-bottom-2 fade-out' : 'animate-in slide-in-from-bottom-2 fade-in'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-xs",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start space-x-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                style: {
                                    backgroundColor: themeColor
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                    className: "h-4 w-4 text-white"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                    lineNumber: 210,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                lineNumber: 206,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium text-gray-900",
                                        children: "Hi! I'm Kwame 👋"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 213,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-600 mt-1",
                                        children: "Need help? Click here to chat with me!"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 214,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleDismissPreview(true),
                                        className: "text-xs text-gray-500 hover:text-gray-700 mt-1 underline",
                                        children: "Don't show again"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 215,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                lineNumber: 212,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleDismissPreview(true),
                                className: "text-gray-400 hover:text-gray-600 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                    lineNumber: 226,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                lineNumber: 222,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                        lineNumber: 205,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                    lineNumber: 204,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                lineNumber: 199,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>{
                    setIsOpen(!isOpen);
                    setShowPreview(false); // Hide preview when opening chat
                },
                className: `fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${isOpen ? 'scale-0' : 'scale-100'}`,
                style: {
                    background: chatButtonImage ? `url(${chatButtonImage}) center/cover` : themeColor
                },
                children: !chatButtonImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                    className: "h-6 w-6 text-white"
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                    lineNumber: 248,
                    columnNumber: 30
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: chatModalRef,
                className: "fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-white p-4 rounded-t-2xl flex items-center justify-between",
                        style: {
                            backgroundColor: themeColor
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                            lineNumber: 264,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 263,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold",
                                                children: "AI Assistant"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                                lineNumber: 267,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-white text-opacity-80",
                                                children: "Ask me anything!"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                                lineNumber: 268,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 266,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                lineNumber: 262,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsOpen(false),
                                className: "hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                    lineNumber: 275,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                lineNumber: 271,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                        lineNumber: 258,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto p-4 space-y-4",
                        children: [
                            chatHistory.map((msg, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'text-white' : 'bg-gray-100 text-gray-900'}`,
                                        style: msg.role === 'user' ? {
                                            backgroundColor: themeColor
                                        } : {},
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm whitespace-pre-wrap",
                                            children: msg.content
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                            lineNumber: 294,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 286,
                                        columnNumber: 17
                                    }, this)
                                }, index, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                    lineNumber: 282,
                                    columnNumber: 15
                                }, this)),
                            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-start",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-100 text-gray-900 max-w-[80%] rounded-2xl px-4 py-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex space-x-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                                                style: {
                                                    animationDelay: '0ms'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                                lineNumber: 302,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                                                style: {
                                                    animationDelay: '150ms'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                                lineNumber: 303,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                                                style: {
                                                    animationDelay: '300ms'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                                lineNumber: 304,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 301,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                    lineNumber: 300,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                lineNumber: 299,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                        lineNumber: 280,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-t",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex space-x-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: message,
                                    onChange: (e)=>setMessage(e.target.value),
                                    onKeyDown: (e)=>{
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    },
                                    placeholder: "Type your message...",
                                    className: "flex-1 resize-none border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 text-sm",
                                    style: {
                                        focusRingColor: themeColor,
                                        '--tw-ring-color': themeColor
                                    },
                                    onFocus: (e)=>{
                                        e.target.style.boxShadow = `0 0 0 2px ${themeColor}40`;
                                    },
                                    onBlur: (e)=>{
                                        e.target.style.boxShadow = '';
                                    },
                                    rows: 2
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                    lineNumber: 314,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSendMessage,
                                    disabled: !message.trim() || isLoading,
                                    className: "disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 transition-opacity",
                                    style: {
                                        backgroundColor: themeColor,
                                        opacity: !message.trim() || isLoading ? 0.5 : 1
                                    },
                                    children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 347,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                        lineNumber: 349,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                                    lineNumber: 337,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                            lineNumber: 313,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                        lineNumber: 312,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx",
                lineNumber: 253,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MainLayout",
    ()=>MainLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$layout$2f$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/layout/sidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$layout$2f$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/layout/header.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$floating$2d$chat$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/floating-chat-button.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
// Memoize Sidebar to prevent re-renders
const MemoizedSidebar = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$layout$2f$sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
// Memoize Header to prevent re-renders
const MemoizedHeader = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["memo"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$layout$2f$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Header"]);
function MainLayout({ children }) {
    const [chatBg, setChatBg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Load from localStorage
        const saved = localStorage.getItem('chatButtonBg');
        if (saved) setChatBg(saved);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen bg-gray-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MemoizedSidebar, {}, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-1 flex-col overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MemoizedHeader, {}, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 overflow-y-auto bg-gray-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6",
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$floating$2d$chat$2d$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FloatingChatButton"], {
                customBackground: chatBg
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/ui/loading-bar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingBar",
    ()=>LoadingBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function LoadingBar({ isLoading, className = '' }) {
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { getThemeColor } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isLoading) {
            setIsVisible(true);
        } else {
            // Add a small delay before hiding to prevent flicker
            const timer = setTimeout(()=>{
                setIsVisible(false);
            }, 300);
            return ()=>clearTimeout(timer);
        }
    }, [
        isLoading
    ]);
    if (!isVisible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed top-0 left-0 right-0 bg-transparent z-50 overflow-hidden ${className}`,
        style: {
            zIndex: 9999,
            height: '3px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full w-full",
                style: {
                    backgroundColor: getThemeColor(),
                    animation: 'loading-bar 1.5s ease-in-out infinite',
                    transform: 'translateX(-100%)'
                }
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/loading-bar.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: `
          @keyframes loading-bar {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `
                }
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/loading-bar.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/ui/loading-bar.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/layout/app-layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppLayout",
    ()=>AppLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$layout$2f$main$2d$layout$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/layout/main-layout.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$loading$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/components/ui/loading-bar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$loading$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/loading-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function AppLayout({ children }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$loading$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLoading"])();
    const [isRouteChanging, setIsRouteChanging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isShopDomain, setIsShopDomain] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Detect if we're on shop domain/port (only on client after mount)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setMounted(true);
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const hostname = undefined;
        const port = undefined;
        const isAdminDomain = undefined;
        const isAdminPort = undefined;
    }, []);
    // Show loading bar on route changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsRouteChanging(true);
        const timer = setTimeout(()=>{
            setIsRouteChanging(false);
        }, 500) // Show for 500ms on route change
        ;
        return ()=>clearTimeout(timer);
    }, [
        pathname
    ]);
    // Don't show admin layout on:
    // - Auth pages
    // - Shop pages (/shop/*)
    // - Root path (/) when on shop domain (only after mounted)
    const isShopRoute = pathname.startsWith('/shop') || pathname === '/' && mounted && isShopDomain;
    const isAuthRoute = pathname.startsWith('/auth/');
    // Before mounted, assume we're not on shop domain to match server render
    // This prevents hydration mismatch
    if (!mounted) {
        // On server or initial render, check if it's a shop route (without domain check)
        if (pathname.startsWith('/shop') || isAuthRoute) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: children
            }, void 0, false);
        }
        // Default to admin layout for root path until we know the domain
        if (pathname === '/') {
            // Show a simple loading state that matches what the page will show
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: children
            }, void 0, false);
        }
        // For other routes, show admin layout
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$loading$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LoadingBar"], {
                    isLoading: isLoading || isRouteChanging
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/app-layout.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$layout$2f$main$2d$layout$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MainLayout"], {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/app-layout.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    if (isAuthRoute || isShopRoute) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    // Show admin layout for all other pages (dashboard, CRM, etc.)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$ui$2f$loading$2d$bar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LoadingBar"], {
                isLoading: isLoading || isRouteChanging
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/app-layout.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$components$2f$layout$2f$main$2d$layout$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MainLayout"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/layout/app-layout.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InitialLoader",
    ()=>InitialLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/contexts/theme-context.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function InitialLoader() {
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [companyLogo, setCompanyLogo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [companyName, setCompanyName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const { status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const { getThemeColor } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$contexts$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    // Fetch company settings for logo
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchCompanySettings = async ()=>{
            try {
                const response = await fetch('/api/settings/company');
                if (response.ok) {
                    const data = await response.json();
                    if (data.favicon) {
                        setCompanyLogo(data.favicon);
                    }
                    if (data.companyName) {
                        setCompanyName(data.companyName);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch company settings:', error);
            }
        };
        fetchCompanySettings();
    }, []);
    // Hide loader when session is loaded
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (status !== 'loading') {
            // Start fade out animation
            setIsLoading(false);
            // Remove from DOM after fade animation completes
            const timer = setTimeout(()=>{
                setIsVisible(false);
            }, 500); // Match the CSS transition duration
            return ()=>clearTimeout(timer);
        }
    }, [
        status
    ]);
    // Don't render if not visible
    if (!isVisible) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`,
        style: {
            pointerEvents: isLoading ? 'auto' : 'none'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-12 flex items-center justify-center",
                children: companyLogo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-80 h-40",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        src: companyLogo,
                        alt: companyName || 'Company Logo',
                        fill: true,
                        className: "object-contain",
                        priority: true,
                        onLoad: (e)=>{
                            // Logo loaded successfully
                            e.currentTarget.style.opacity = '1';
                        },
                        style: {
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out'
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx",
                        lineNumber: 69,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx",
                    lineNumber: 68,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-4xl font-bold text-gray-800",
                    children: companyName
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx",
                    lineNumber: 83,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-80 h-1 bg-gray-200 rounded-full overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full rounded-full animate-progress",
                    style: {
                        backgroundColor: getThemeColor()
                    }
                }, void 0, false, {
                    fileName: "[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/adpoolsgroup/src/components/initial-loader.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/adpoolsgroup/src/components/conditional-admin-components.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConditionalAdminComponents",
    ()=>ConditionalAdminComponents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function ConditionalAdminComponents({ children }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [shouldRender, setShouldRender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Check if we're on shop domain/port
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            // Server-side: default to false, will be set correctly on client
            setShouldRender(false);
        }
    }, [
        pathname
    ]);
    // Don't render admin components on shop pages
    if (!shouldRender) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3e7a5584._.js.map