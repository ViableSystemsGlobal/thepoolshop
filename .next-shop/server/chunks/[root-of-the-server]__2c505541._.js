module.exports = [
"[project]/Desktop/adpoolsgroup/.next-internal/server/app/api/public/shop/cart/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

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
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/Desktop/adpoolsgroup/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/Desktop/adpoolsgroup/src/lib/currency.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateProductPrice",
    ()=>calculateProductPrice,
    "convertCurrency",
    ()=>convertCurrency,
    "formatCurrency",
    ()=>formatCurrency,
    "getCurrencySymbol",
    ()=>getCurrencySymbol,
    "getExchangeRate",
    ()=>getExchangeRate,
    "getSupportedCurrencies",
    ()=>getSupportedCurrencies,
    "updateExchangeRate",
    ()=>updateExchangeRate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function getExchangeRate(fromCurrency, toCurrency, date) {
    try {
        if (fromCurrency === toCurrency) return 1;
        const effectiveDate = date || new Date();
        // First, try to find direct rate
        let exchangeRate = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].exchangeRate.findFirst({
            where: {
                fromCurrency,
                toCurrency,
                isActive: true,
                effectiveFrom: {
                    lte: effectiveDate
                },
                OR: [
                    {
                        effectiveTo: null
                    },
                    {
                        effectiveTo: {
                            gte: effectiveDate
                        }
                    }
                ]
            },
            orderBy: {
                effectiveFrom: 'desc'
            }
        });
        // If no direct rate found, try reverse rate (inverse calculation)
        if (!exchangeRate) {
            const reverseRate = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].exchangeRate.findFirst({
                where: {
                    fromCurrency: toCurrency,
                    toCurrency: fromCurrency,
                    isActive: true,
                    effectiveFrom: {
                        lte: effectiveDate
                    },
                    OR: [
                        {
                            effectiveTo: null
                        },
                        {
                            effectiveTo: {
                                gte: effectiveDate
                            }
                        }
                    ]
                },
                orderBy: {
                    effectiveFrom: 'desc'
                }
            });
            if (reverseRate && reverseRate.rate) {
                // Calculate inverse rate
                const inverseRate = 1 / Number(reverseRate.rate);
                return Math.round(inverseRate * 10000) / 10000; // Round to 4 decimal places
            }
        }
        return exchangeRate ? Number(exchangeRate.rate) : null;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return null;
    }
}
async function convertCurrency(fromCurrency, toCurrency, amount, date) {
    try {
        if (fromCurrency === toCurrency) {
            return {
                fromCurrency,
                toCurrency,
                amount,
                convertedAmount: amount,
                exchangeRate: 1,
                source: 'same_currency'
            };
        }
        const exchangeRate = await getExchangeRate(fromCurrency, toCurrency, date);
        if (!exchangeRate) {
            console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}, using amount as-is`);
            // Return original amount if no exchange rate found (fallback)
            return {
                fromCurrency,
                toCurrency,
                amount,
                convertedAmount: amount,
                exchangeRate: 1,
                source: 'fallback'
            };
        }
        const convertedAmount = amount * exchangeRate;
        return {
            fromCurrency,
            toCurrency,
            amount,
            convertedAmount: Math.round(convertedAmount * 100) / 100,
            exchangeRate,
            source: 'database'
        };
    } catch (error) {
        console.error('Error converting currency:', error);
        return null;
    }
}
async function updateExchangeRate(fromCurrency, toCurrency, rate, source = 'manual', effectiveFrom, effectiveTo) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].exchangeRate.create({
            data: {
                fromCurrency,
                toCurrency,
                rate,
                source,
                effectiveFrom: effectiveFrom || new Date(),
                effectiveTo
            }
        });
        return true;
    } catch (error) {
        console.error('Error updating exchange rate:', error);
        return false;
    }
}
async function getSupportedCurrencies() {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].currency.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                code: 'asc'
            }
        });
    } catch (error) {
        console.error('Error fetching currencies:', error);
        return [];
    }
}
function formatCurrency(amount, currencyCode, currencySymbol) {
    const symbol = currencySymbol || getCurrencySymbol(currencyCode);
    // Format number with proper decimal places
    const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
    return `${symbol}${formattedAmount}`;
}
function getCurrencySymbol(currencyCode) {
    const symbols = {
        'USD': '$',
        'GHS': 'GH₵',
        'EUR': '€',
        'GBP': '£',
        'NGN': '₦',
        'KES': 'KSh',
        'ZAR': 'R',
        'EGP': 'E£',
        'MAD': 'MAD',
        'TND': 'DT'
    };
    return symbols[currencyCode] || currencyCode;
}
async function calculateProductPrice(productId, targetCurrency, date) {
    try {
        const product = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].product.findUnique({
            where: {
                id: productId
            }
        });
        if (!product || !product.price) {
            return null;
        }
        const basePrice = Number(product.price);
        const baseCurrency = product.importCurrency;
        if (baseCurrency === targetCurrency) {
            return {
                basePrice,
                baseCurrency,
                convertedPrice: basePrice,
                targetCurrency,
                exchangeRate: 1
            };
        }
        const conversion = await convertCurrency(baseCurrency, targetCurrency, basePrice, date);
        if (!conversion) {
            return null;
        }
        return {
            basePrice,
            baseCurrency,
            convertedPrice: conversion.convertedAmount,
            targetCurrency,
            exchangeRate: conversion.exchangeRate
        };
    } catch (error) {
        console.error('Error calculating product price:', error);
        return null;
    }
}
}),
"[project]/Desktop/adpoolsgroup/src/app/api/public/shop/cart/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$currency$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/currency.ts [app-route] (ecmascript)");
;
;
;
;
;
// Helper function to get or create cart session
async function getCartSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    let cartId = cookieStore.get("cart_session")?.value;
    if (!cartId) {
        cartId = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID();
        cookieStore.set("cart_session", cartId, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        });
    }
    return cartId;
}
async function GET() {
    try {
        const cartId = await getCartSession();
        // For now, we'll store cart in session/cookies
        // In production, you might want to store in database
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const cartData = cookieStore.get(`cart_${cartId}`)?.value;
        if (!cartData) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
                itemCount: 0
            });
        }
        const cart = JSON.parse(cartData);
        // Validate items still exist and have stock
        const validatedItems = [];
        let subtotal = 0;
        for (const item of cart.items){
            const product = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].product.findUnique({
                where: {
                    id: item.productId,
                    active: true
                },
                include: {
                    category: true,
                    stockItems: {
                        select: {
                            available: true
                        }
                    }
                }
            });
            if (product) {
                const totalStock = product.stockItems.reduce((sum, si)=>sum + si.available, 0);
                const quantity = Math.min(item.quantity, totalStock);
                if (quantity > 0) {
                    let images = [];
                    if (product.images) {
                        try {
                            images = JSON.parse(product.images);
                        } catch  {
                            images = [
                                product.images
                            ];
                        }
                    }
                    // Convert price from product's base currency to GHS
                    let priceInGHS = product.price || 0;
                    const baseCurrency = product.baseCurrency || "GHS";
                    if (baseCurrency !== "GHS" && product.price) {
                        const priceConversion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$currency$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertCurrency"])(baseCurrency, "GHS", product.price);
                        if (priceConversion) {
                            priceInGHS = priceConversion.convertedAmount;
                        }
                    }
                    const lineTotalInGHS = priceInGHS * quantity;
                    subtotal += lineTotalInGHS;
                    validatedItems.push({
                        productId: product.id,
                        name: product.name,
                        sku: product.sku,
                        price: priceInGHS,
                        currency: "GHS",
                        quantity,
                        maxQuantity: totalStock,
                        lineTotal: lineTotalInGHS,
                        image: images[0] || null
                    });
                }
            }
        }
        const tax = subtotal * 0.125; // 12.5% VAT
        const total = subtotal + tax;
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: validatedItems,
            subtotal,
            tax,
            total,
            itemCount: validatedItems.reduce((sum, item)=>sum + item.quantity, 0)
        });
    } catch (error) {
        console.error("Error getting cart:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to get cart"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const cartId = await getCartSession();
        const body = await request.json();
        const { productId, quantity = 1 } = body;
        if (!productId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Product ID is required"
            }, {
                status: 400
            });
        }
        // Validate product exists and has stock
        const product = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].product.findUnique({
            where: {
                id: productId,
                active: true
            },
            include: {
                stockItems: true
            }
        });
        if (!product) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Product not found"
            }, {
                status: 404
            });
        }
        const totalStock = product.stockItems.reduce((sum, item)=>sum + item.available, 0);
        if (totalStock < quantity) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Insufficient stock",
                availableStock: totalStock
            }, {
                status: 400
            });
        }
        // Get current cart
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const cartData = cookieStore.get(`cart_${cartId}`)?.value;
        let cart = cartData ? JSON.parse(cartData) : {
            items: []
        };
        // Add or update item in cart
        const existingItemIndex = cart.items.findIndex((item)=>item.productId === productId);
        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity = Math.min(cart.items[existingItemIndex].quantity + quantity, totalStock);
        } else {
            cart.items.push({
                productId,
                quantity: Math.min(quantity, totalStock)
            });
        }
        // Save cart
        cookieStore.set(`cart_${cartId}`, JSON.stringify(cart), {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Item added to cart",
            cartItemCount: cart.items.reduce((sum, item)=>sum + item.quantity, 0)
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to add item to cart"
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const cartId = await getCartSession();
        const body = await request.json();
        const { productId, quantity } = body;
        if (!productId || quantity === undefined) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Product ID and quantity are required"
            }, {
                status: 400
            });
        }
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const cartData = cookieStore.get(`cart_${cartId}`)?.value;
        if (!cartData) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cart not found"
            }, {
                status: 404
            });
        }
        let cart = JSON.parse(cartData);
        if (quantity <= 0) {
            // Remove item from cart
            cart.items = cart.items.filter((item)=>item.productId !== productId);
        } else {
            // Update quantity
            const itemIndex = cart.items.findIndex((item)=>item.productId === productId);
            if (itemIndex >= 0) {
                // Validate stock
                const product = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].product.findUnique({
                    where: {
                        id: productId
                    },
                    include: {
                        stockItems: true
                    }
                });
                if (product) {
                    const totalStock = product.stockItems.reduce((sum, item)=>sum + item.available, 0);
                    cart.items[itemIndex].quantity = Math.min(quantity, totalStock);
                }
            }
        }
        // Save cart
        cookieStore.set(`cart_${cartId}`, JSON.stringify(cart), {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Cart updated"
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to update cart"
        }, {
            status: 500
        });
    }
}
async function DELETE() {
    try {
        const cartId = await getCartSession();
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        cookieStore.delete(`cart_${cartId}`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Cart cleared"
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to clear cart"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2c505541._.js.map