import { prisma } from "@/lib/prisma";
import { StockMovementsClient } from "./stock-movements-client";

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
  }

  return (
    <>
      <StockMovementsClient initialMovements={movements} />
    </>
  );
}