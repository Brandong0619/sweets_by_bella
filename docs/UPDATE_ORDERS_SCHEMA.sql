-- Update orders table for Zelle/Cash App payment system
-- Add payment-related columns

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50), -- 'zelle' or 'cashapp'
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled', 'expired'
ADD COLUMN IF NOT EXISTS order_reference VARCHAR(20), -- Auto-generated like 'ORDER-123'
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP, -- 5 minutes from order creation
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20); -- For Zelle/Cash App verification

-- Add constraint for payment_status
ALTER TABLE orders 
ADD CONSTRAINT payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'expired'));

-- Add constraint for payment_method
ALTER TABLE orders 
ADD CONSTRAINT payment_method_check 
CHECK (payment_method IN ('zelle', 'cashapp'));

-- Create index for faster queries on payment_status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Create index for faster queries on order_reference
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(order_reference);

-- Update existing orders to have default values
UPDATE orders 
SET 
  payment_status = 'paid',
  payment_method = 'stripe', -- Mark existing orders as paid via Stripe
  order_reference = 'ORDER-' || EXTRACT(EPOCH FROM created_at)::INTEGER
WHERE payment_status IS NULL;
