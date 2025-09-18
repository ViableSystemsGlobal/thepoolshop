-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SALES_REP',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "exchange_rates_fromCurrency_fkey" FOREIGN KEY ("fromCurrency") REFERENCES "currencies" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT,
    "attributes" JSONB,
    "uomBase" TEXT NOT NULL DEFAULT 'pcs',
    "uomSell" TEXT NOT NULL DEFAULT 'pcs',
    "price" REAL,
    "cost" REAL,
    "originalPrice" REAL,
    "originalCost" REAL,
    "originalPriceCurrency" TEXT,
    "originalCostCurrency" TEXT,
    "exchangeRateAtImport" REAL,
    "lastExchangeRateUpdate" DATETIME,
    "baseCurrency" TEXT NOT NULL DEFAULT 'GHS',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_documents_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'direct',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "price_list_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "basePrice" REAL,
    "exchangeRate" REAL,
    "overrides" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "price_list_items_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "price_lists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "price_list_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accounts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "accountId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contacts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "leads_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "value" REAL,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "closeDate" DATETIME,
    "accountId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opportunities_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "validUntil" DATETIME,
    "notes" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "accountId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "quotations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quotations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quotation_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "lineTotal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "quotation_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quotation_lines_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proformas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "validUntil" DATETIME,
    "notes" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "quotationId" TEXT,
    "accountId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "proformas_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "proformas_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "proformas_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proforma_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proformaId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "lineTotal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "proforma_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "proforma_lines_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "proformas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "reserved" REAL NOT NULL DEFAULT 0,
    "available" REAL NOT NULL DEFAULT 0,
    "averageCost" REAL NOT NULL DEFAULT 0,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "reorderPoint" REAL NOT NULL DEFAULT 0,
    "warehouseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stock_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stock_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitCost" REAL,
    "totalCost" REAL,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "warehouseId" TEXT,
    "reference" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_fromCurrency_toCurrency_effectiveFrom_key" ON "exchange_rates"("fromCurrency", "toCurrency", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_items_productId_priceListId_key" ON "price_list_items"("productId", "priceListId");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_number_key" ON "quotations"("number");

-- CreateIndex
CREATE UNIQUE INDEX "proformas_number_key" ON "proformas"("number");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_productId_warehouseId_key" ON "stock_items"("productId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_name_key" ON "warehouses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
