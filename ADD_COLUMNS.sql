-- Add product_name and salon_name columns to analytics_events table
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS salon_name TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_name ON analytics_events(product_name);
CREATE INDEX IF NOT EXISTS idx_salon_name ON analytics_events(salon_name);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analytics_events' 
AND column_name IN ('product_name', 'salon_name');

