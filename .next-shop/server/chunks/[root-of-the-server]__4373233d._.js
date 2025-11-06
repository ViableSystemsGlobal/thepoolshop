module.exports = [
"[project]/Desktop/adpoolsgroup/.next-internal/server/app/api/public/shop/checkout/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/Desktop/adpoolsgroup/src/app/api/public/shop/checkout/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/adpoolsgroup/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
;
// Helper to generate order number
function generateOrderNumber() {
    const prefix = "ORD";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}
async function POST(request) {
    try {
        const body = await request.json();
        const { customer, shippingAddress, billingAddress, paymentMethod = "CASH", notes } = body;
        // Validate required fields
        if (!customer || !customer.email || !customer.name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Customer information is required"
            }, {
                status: 400
            });
        }
        if (!shippingAddress) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Shipping address is required"
            }, {
                status: 400
            });
        }
        // Get cart session
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const cartId = cookieStore.get("cart_session")?.value;
        if (!cartId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No cart found"
            }, {
                status: 400
            });
        }
        const cartData = cookieStore.get(`cart_${cartId}`)?.value;
        if (!cartData) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cart is empty"
            }, {
                status: 400
            });
        }
        const cart = JSON.parse(cartData);
        if (!cart.items || cart.items.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cart is empty"
            }, {
                status: 400
            });
        }
        // Start transaction
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            // Check if customer exists or create new lead
            let lead = await tx.lead.findFirst({
                where: {
                    email: customer.email
                }
            });
            // Get default system user (for owner assignment) - moved outside if block
            let systemUser = await tx.user.findFirst({
                where: {
                    OR: [
                        {
                            role: "ADMIN"
                        },
                        {
                            role: "SUPER_ADMIN"
                        }
                    ]
                }
            });
            // If no admin user found, create a default one
            if (!systemUser) {
                systemUser = await tx.user.create({
                    data: {
                        email: "system@thepoolshop.africa",
                        name: "System User",
                        role: "ADMIN"
                    }
                });
            }
            if (!lead) {
                // Create new lead from customer
                const [firstName, ...lastNameParts] = customer.name.split(" ");
                const lastName = lastNameParts.join(" ") || firstName;
                lead = await tx.lead.create({
                    data: {
                        firstName,
                        lastName,
                        email: customer.email,
                        phone: customer.phone || "",
                        company: customer.company,
                        status: "NEW",
                        leadType: "INDIVIDUAL",
                        source: "ECOMMERCE",
                        subject: "Online Store Customer",
                        ownerId: systemUser ? systemUser.id : "system",
                        billingAddress: billingAddress || shippingAddress,
                        shippingAddress: shippingAddress,
                        hasBillingAddress: true,
                        hasShippingAddress: true,
                        sameAsBilling: !billingAddress
                    }
                });
            }
            // Create quotation from cart
            const quotationNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
            // Calculate totals
            let subtotal = 0;
            const quotationLines = [];
            for (const item of cart.items){
                const product = await tx.product.findUnique({
                    where: {
                        id: item.productId
                    },
                    include: {
                        stockItems: true
                    }
                });
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                const totalStock = product.stockItems.reduce((sum, si)=>sum + si.available, 0);
                if (totalStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${totalStock}, Requested: ${item.quantity}`);
                }
                const lineTotal = (product.price || 0) * item.quantity;
                subtotal += lineTotal;
                quotationLines.push({
                    productId: product.id,
                    quantity: item.quantity,
                    unitPrice: product.price || 0,
                    discount: 0,
                    lineTotal
                });
            }
            const tax = subtotal * 0.125; // 12.5% VAT
            const total = subtotal + tax;
            // Create quotation
            const quotation = await tx.quotation.create({
                data: {
                    number: quotationNumber,
                    status: "SENT",
                    subject: `Online Order - ${customer.name}`,
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    notes: notes || "Order placed via online store",
                    currency: "GHS",
                    subtotal,
                    tax,
                    total,
                    taxInclusive: true,
                    leadId: lead.id,
                    ownerId: systemUser ? systemUser.id : "system",
                    customerType: "STANDARD",
                    billingAddressSnapshot: billingAddress || shippingAddress,
                    shippingAddressSnapshot: shippingAddress,
                    lines: {
                        create: quotationLines
                    }
                },
                include: {
                    lines: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Create invoice from quotation
            const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
            const invoice = await tx.invoice.create({
                data: {
                    number: invoiceNumber,
                    subject: `Invoice - ${customer.name}`,
                    quotationId: quotation.id,
                    leadId: lead.id,
                    status: "SENT",
                    paymentStatus: paymentMethod === "CASH" ? "UNPAID" : "UNPAID",
                    issueDate: new Date(),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    currency: "GHS",
                    subtotal,
                    tax,
                    discount: 0,
                    total,
                    amountPaid: 0,
                    amountDue: total,
                    taxInclusive: true,
                    paymentTerms: "Net 7 days",
                    customerType: "STANDARD",
                    billingAddressSnapshot: billingAddress || shippingAddress,
                    shippingAddressSnapshot: shippingAddress,
                    notes: `Payment Method: ${paymentMethod}\n${notes || ""}`,
                    ownerId: systemUser ? systemUser.id : "system",
                    lines: {
                        create: quotationLines.map((line)=>({
                                productId: line.productId,
                                quantity: line.quantity,
                                unitPrice: line.unitPrice,
                                discount: line.discount,
                                lineTotal: line.lineTotal
                            }))
                    }
                },
                include: {
                    lines: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Update stock levels
            for (const item of cart.items){
                // Get stock items for the product
                const stockItems = await tx.stockItem.findMany({
                    where: {
                        productId: item.productId,
                        available: {
                            gt: 0
                        }
                    },
                    orderBy: {
                        available: "asc"
                    }
                });
                let remainingQuantity = item.quantity;
                for (const stockItem of stockItems){
                    if (remainingQuantity <= 0) break;
                    const quantityToDeduct = Math.min(remainingQuantity, stockItem.available);
                    // Update stock item
                    await tx.stockItem.update({
                        where: {
                            id: stockItem.id
                        },
                        data: {
                            available: stockItem.available - quantityToDeduct,
                            reserved: stockItem.reserved + quantityToDeduct
                        }
                    });
                    // Create stock movement
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            stockItemId: stockItem.id,
                            type: "SALE",
                            quantity: -quantityToDeduct,
                            reference: invoice.number,
                            reason: "Online store sale",
                            notes: "Invoice: " + invoice.number,
                            warehouseId: stockItem.warehouseId
                        }
                    });
                    remainingQuantity -= quantityToDeduct;
                }
            }
            return {
                quotation,
                invoice,
                lead
            };
        });
        // Clear the cart after successful transaction
        const clearCookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        clearCookieStore.delete(`cart_${cartId}`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Order placed successfully",
            order: {
                quotationNumber: result.quotation.number,
                invoiceNumber: result.invoice.number,
                total: result.invoice.total,
                currency: result.invoice.currency,
                status: "PROCESSING"
            }
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$adpoolsgroup$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : "Checkout failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4373233d._.js.map