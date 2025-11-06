module.exports = [
"[project]/Desktop/adpoolsgroup/.next-internal/server/app/api/public/shop/products/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/Desktop/adpoolsgroup/src/app/api/public/shop/products/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$currency$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/currency.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const sort = searchParams.get("sort") || "newest";
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const where = {
            active: true,
            type: "PRODUCT"
        };
        // Search filter
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    sku: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        // Category filter
        if (category) {
            where.categoryId = category;
        }
        // Price range filter
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }
        // Determine sort order
        let orderBy = {};
        switch(sort){
            case "price-asc":
                orderBy = {
                    price: "asc"
                };
                break;
            case "price-desc":
                orderBy = {
                    price: "desc"
                };
                break;
            case "name":
                orderBy = {
                    name: "asc"
                };
                break;
            case "newest":
            default:
                orderBy = {
                    createdAt: "desc"
                };
        }
        // Get products with stock information
        const products = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].product.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                stockItems: {
                    select: {
                        available: true,
                        warehouseId: true
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy
        });
        // Transform products for public consumption
        const transformedProducts = await Promise.all(products.map(async (product)=>{
            // Calculate total stock across all warehouses
            const totalStock = product.stockItems.reduce((sum, item)=>sum + item.available, 0);
            // Parse images if stored as JSON string
            let images = [];
            if (product.images) {
                try {
                    images = JSON.parse(product.images);
                } catch  {
                    images = [
                        product.images
                    ]; // Fallback if not JSON
                }
            }
            // Convert prices from product's base currency to GHS
            let priceInGHS = product.price || 0;
            let originalPriceInGHS = product.originalPrice || null;
            const baseCurrency = product.baseCurrency || "GHS";
            if (baseCurrency !== "GHS" && product.price) {
                const priceConversion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$currency$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertCurrency"])(baseCurrency, "GHS", product.price);
                if (priceConversion) {
                    priceInGHS = priceConversion.convertedAmount;
                }
            }
            if (originalPriceInGHS && baseCurrency !== "GHS") {
                const originalPriceConversion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$currency$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertCurrency"])(baseCurrency, "GHS", originalPriceInGHS);
                if (originalPriceConversion) {
                    originalPriceInGHS = originalPriceConversion.convertedAmount;
                }
            }
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: priceInGHS,
                originalPrice: originalPriceInGHS,
                currency: "GHS",
                sku: product.sku,
                images: images,
                category: product.category,
                inStock: totalStock > 0,
                stockQuantity: totalStock,
                lowStock: totalStock > 0 && totalStock <= 5
            };
        }));
        // Get total count for pagination
        const total = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].product.count({
            where
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            products: transformedProducts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching shop products:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch products"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { productId } = body;
        if (!productId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Product ID is required"
            }, {
                status: 400
            });
        }
        const product = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].product.findUnique({
            where: {
                id: productId,
                active: true
            },
            include: {
                category: true,
                stockItems: {
                    select: {
                        available: true,
                        warehouseId: true
                    }
                }
            }
        });
        if (!product) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Product not found"
            }, {
                status: 404
            });
        }
        // Calculate total stock
        const totalStock = product.stockItems.reduce((sum, item)=>sum + item.available, 0);
        // Parse images
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
        // Parse attributes for additional product details
        let attributes = {};
        if (product.attributes) {
            try {
                attributes = JSON.parse(product.attributes);
            } catch  {
                attributes = {};
            }
        }
        // Convert prices from product's base currency to GHS
        let priceInGHS = product.price || 0;
        let originalPriceInGHS = product.originalPrice || null;
        const baseCurrency = product.baseCurrency || "GHS";
        if (baseCurrency !== "GHS" && product.price) {
            const priceConversion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$currency$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertCurrency"])(baseCurrency, "GHS", product.price);
            if (priceConversion) {
                priceInGHS = priceConversion.convertedAmount;
            }
        }
        if (originalPriceInGHS && baseCurrency !== "GHS") {
            const originalPriceConversion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$currency$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertCurrency"])(baseCurrency, "GHS", originalPriceInGHS);
            if (originalPriceConversion) {
                originalPriceInGHS = originalPriceConversion.convertedAmount;
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: product.id,
            name: product.name,
            description: product.description,
            price: priceInGHS,
            originalPrice: originalPriceInGHS,
            currency: "GHS",
            sku: product.sku,
            barcode: product.barcode,
            images: images,
            category: product.category,
            attributes: attributes,
            inStock: totalStock > 0,
            stockQuantity: totalStock,
            lowStock: totalStock > 0 && totalStock <= 5
        });
    } catch (error) {
        console.error("Error fetching product details:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch product"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ada97bff._.js.map