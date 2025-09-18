import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to parse CSV content with flexible column mapping
function parseCSV(content: string): any[] {
  try {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      console.log('CSV has less than 2 lines');
      return [];
    }
    
    const originalHeaders = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    console.log('CSV headers:', originalHeaders);
    
    // Column mapping for flexible header names
    const columnMap: { [key: string]: string } = {
      'SKU': 'sku', 'sku': 'sku', 'product_sku': 'sku',
      'Name': 'name', 'name': 'name', 'product_name': 'name',
      'Description': 'description', 'description': 'description', 'product_description': 'description',
      'Price': 'price', 'price': 'price', 'selling_price': 'price',
      'Cost': 'cost', 'cost': 'cost', 'cost_price': 'cost', 'purchase_price': 'cost',
      'Quantity': 'quantity', 'quantity': 'quantity', 'stock_quantity': 'quantity',
      'Reorder Point': 'reorder_point', 'reorder_point': 'reorder_point',
      'Import Currency': 'import_currency', 'import_currency': 'import_currency', 'currency': 'import_currency',
      'UOM Base': 'uom_base', 'uom_base': 'uom_base', 'unit_base': 'uom_base',
      'UOM Sell': 'uom_sell', 'uom_sell': 'uom_sell', 'unit_sell': 'uom_sell',
      'Active': 'active', 'active': 'active'
    };
    
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Handle CSV parsing more robustly - handle quoted fields
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/['"]/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/['"]/g, ''));
      
      const row: any = {};
      
      originalHeaders.forEach((header, index) => {
        const normalizedKey = columnMap[header] || header.toLowerCase();
        row[normalizedKey] = values[index] || '';
      });
      
      rows.push(row);
    }
    
    console.log(`Parsed ${rows.length} rows from CSV`);
    return rows;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// POST /api/products/bulk-import - Bulk import products from CSV/Excel file
export async function POST(request: NextRequest) {
  try {
    console.log('Starting bulk import process...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file provided');
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    const fileContent = await file.text();
    console.log(`File content length: ${fileContent.length} characters`);
    
    const csvData = parseCSV(fileContent);
    console.log(`Parsed CSV data: ${csvData.length} rows`);
    
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

      if (!defaultWarehouse) {
        return NextResponse.json(
          { error: "No warehouses found. Please create a warehouse first." },
          { status: 400 }
        );
      }

      for (const row of csvData) {
        try {
          // Validate required fields
          if (!row.sku || !row.name) {
            result.errors.push(`Missing required fields: SKU and Name are required for row`);
            continue;
          }

          // Check for duplicate SKU
          const existingProduct = await prisma.product.findUnique({
            where: { sku: row.sku }
          });
          
          if (existingProduct) {
            result.errors.push(`SKU '${row.sku}' already exists. Skipping product: ${row.name}`);
            continue;
          }

          // Map CSV columns to product data using normalized field names
          const costPrice = parseFloat(row.cost || '0') || 0;
          const productData = {
            name: row.name || `Imported Product ${Date.now()}`,
            sku: row.sku || `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: row.description || "Imported from bulk upload",
            price: parseFloat(row.price || '0') || 0,
            cost: costPrice,
            originalPrice: parseFloat(row.price || '0') || 0,
            originalCost: costPrice,
            originalPriceCurrency: row.import_currency || 'USD',
            originalCostCurrency: row.import_currency || 'USD',
            categoryId: defaultCategory.id,
            active: row.active === 'true' || row.active === '1' || row.active === 'yes' || row.active === '' || row.active === undefined,
            uomBase: row.uom_base || 'pcs',
            uomSell: row.uom_sell || 'pcs'
          };

          const product = await prisma.product.create({
            data: productData
          });

          // Create stock item for the product
          const initialQuantity = parseFloat(row.quantity || '0') || 0;
          const totalValue = initialQuantity * costPrice;
          const reorderPoint = parseFloat(row.reorder_point || '0') || 0;
          
          await prisma.stockItem.create({
            data: {
              productId: product.id,
              warehouseId: defaultWarehouse.id,
              quantity: initialQuantity,
              reserved: 0,
              available: initialQuantity,
              averageCost: productData.cost || 0,
              totalValue: totalValue,
              reorderPoint: reorderPoint
            }
          });

          result.success++;
        } catch (rowError) {
          console.error('Error processing row:', row, rowError);
          result.errors.push(`Error processing product: ${row.name || 'Unknown'} - ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
        }
      }
    } catch (dbError) {
      console.error('Database error during bulk import:', dbError);
      result.errors.push('Database error occurred during import');
    }

    console.log(`Import completed: ${result.success} successful, ${result.errors.length} errors`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing bulk import:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: `Failed to process bulk import: ${errorMessage}`,
        success: 0,
        errors: [`Import failed: ${errorMessage}`],
        warnings: []
      },
      { status: 500 }
    );
  }
}
