-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN "supplierId" TEXT;

-- AddForeignKey (if stock_movements table doesn't already have this FK)
-- Check if foreign key exists first to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stock_movements_supplierId_fkey'
        AND table_name = 'stock_movements'
    ) THEN
        ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_supplierId_fkey" 
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END$$;

