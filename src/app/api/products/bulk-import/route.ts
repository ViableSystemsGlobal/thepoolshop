import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to parse CSV content
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

// POST /api/products/bulk-import - Bulk import products from CSV/Excel file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const csvData = parseCSV(fileContent);
    
    const result = {
      success: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (csvData.length === 0) {
      return NextResponse.json(
        { error: "No valid data found in the file" },
        { status: 400 }
      );
    }

    try {
      // Get default category and warehouse
      const defaultCategory = await prisma.category.findFirst();
      const defaultWarehouse = await prisma.warehouse.findFirst();
      
      if (!defaultCategory) {
        return NextResponse.json(
          { error: "No categories found. Please create a category first." },
          { status: 400 }
        );
      }

      for (const row of csvData) {
        try {
          // Map CSV columns to product data
          const productData = {
            name: row.name || row.product_name || `Imported Product ${Date.now()}`,
            sku: row.sku || row.product_sku || `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: row.description || row.product_description || "Imported from bulk upload",
            price: parseFloat(row.price || row.selling_price || '0') || 0,
            cost: parseFloat(row.cost || row.purchase_price || '0') || 0,
            originalPrice: parseFloat(row.price || row.selling_price || '0') || 0,
            originalCost: parseFloat(row.cost || row.purchase_price || '0') || 0,
            originalPriceCurrency: row.import_currency || row.currency || 'USD',
            originalCostCurrency: row.import_currency || row.currency || 'USD',
            categoryId: defaultCategory.id,
            active: row.active === 'true' || row.active === '1' || row.active === 'yes' || row.active === '',
            uomBase: row.uom_base || row.unit_base || 'pcs',
            uomSell: row.uom_sell || row.unit_sell || 'pcs'
          };

          const product = await prisma.product.create({
            data: productData
          });

          // Create stock item for the product
          const initialQuantity = parseFloat(row.quantity || row.stock_quantity || '0') || 0;
          const sellingPrice = productData.price || 0;
          const totalValue = initialQuantity * sellingPrice;
          
          await prisma.stockItem.create({
            data: {
              productId: product.id,
              warehouseId: defaultWarehouse?.id || null,
              quantity: initialQuantity,
              reserved: 0,
              available: initialQuantity,
              averageCost: productData.cost || 0,
              totalValue: totalValue,
              reorderPoint: parseFloat(row.reorder_point || '0') || 0
            }
          });

          result.success++;
        } catch (rowError) {
          console.error('Error processing row:', row, rowError);
          result.errors.push(`Error processing product: ${row.name || row.product_name || 'Unknown'}`);
        }
      }
    } catch (dbError) {
      console.error('Database error during bulk import:', dbError);
      result.errors.push('Database error occurred during import');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing bulk import:", error);
    return NextResponse.json(
      { error: "Failed to process bulk import" },
      { status: 500 }
    );
  }
}
