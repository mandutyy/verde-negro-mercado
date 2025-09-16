-- Add reservation support to the existing orders system

-- Add new status values for plants to support reservations
ALTER TYPE public.plant_status DROP CONSTRAINT IF EXISTS plant_status_check;
DROP TYPE IF EXISTS public.plant_status CASCADE;
CREATE TYPE public.plant_status AS ENUM ('active', 'reserved', 'sold', 'inactive');

-- Update plants table to use the new enum (if not already done)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='plants' AND column_name='status' AND data_type='USER-DEFINED') THEN
        ALTER TABLE plants ALTER COLUMN status TYPE plant_status USING status::plant_status;
    END IF;
END $$;

-- Add reservation-specific fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reservation_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reservation_notes TEXT;

-- Update order_type constraint to include reservation
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_order_type_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_order_type_check 
CHECK (order_type IN ('purchase', 'exchange', 'gift', 'reservation'));

-- Add index for better reservation queries
CREATE INDEX IF NOT EXISTS idx_orders_reservation 
ON orders (plant_id, order_type, status) 
WHERE order_type = 'reservation';

-- Add RLS policy for reservations
CREATE POLICY IF NOT EXISTS "Users can create reservations" 
ON orders 
FOR INSERT 
WITH CHECK (
  auth.uid() = buyer_id 
  AND order_type = 'reservation'
  AND buyer_id <> seller_id
);

-- Create function to auto-expire reservations
CREATE OR REPLACE FUNCTION expire_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark expired reservations as cancelled
  UPDATE orders 
  SET status = 'cancelled'
  WHERE order_type = 'reservation' 
    AND status = 'pending'
    AND reservation_until < NOW();
  
  -- Update plant status back to active for expired reservations
  UPDATE plants 
  SET status = 'active'
  WHERE id IN (
    SELECT DISTINCT plant_id 
    FROM orders 
    WHERE order_type = 'reservation' 
      AND status = 'cancelled'
      AND reservation_until < NOW()
  )
  AND status = 'reserved';
END;
$$;