import { prisma } from "@/lib/prisma";
import { StockMovementsClient } from "./stock-movements-client";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StockMovementsPage() {
  // Fetch movements server-side to ensure data is available
  let movements = [];
  try {
    movements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uomBase: true,
            images: true,
          }
        },
        stockItem: {
          select: {
            id: true,
            quantity: true,
            available: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (error) {
    console.error('Database error:', error);
    // Return empty array if database is not available
    movements = [];
  }

  return (
    <>
      <StockMovementsClient initialMovements={movements} />
    </>
  );
}