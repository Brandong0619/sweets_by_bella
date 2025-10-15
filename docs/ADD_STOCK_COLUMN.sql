-- Add stock column to Cookies table
-- This allows tracking how many of each cookie are available

-- Add the stock column (default to 0 = sold out)
ALTER TABLE "Cookies" 
ADD COLUMN IF NOT EXISTS "stock" INTEGER DEFAULT 0;

-- Update existing products to have some stock (optional)
-- You can run this to set initial stock for existing products
-- UPDATE "Cookies" SET "stock" = 12 WHERE "stock" = 0;

-- Add a check constraint to ensure stock is never negative
ALTER TABLE "Cookies"
ADD CONSTRAINT stock_non_negative CHECK (stock >= 0);

-- Example: View all products with their stock levels
-- SELECT id, name, price, stock, 
--        CASE WHEN stock = 0 THEN 'SOLD OUT' ELSE 'IN STOCK' END as status
-- FROM "Cookies"
-- ORDER BY stock DESC;

