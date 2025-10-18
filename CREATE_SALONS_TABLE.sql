-- ===================================
-- STEP 1: Create Salons Table
-- ===================================

CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  phone TEXT,
  specialties TEXT[] NOT NULL,
  services TEXT[] NOT NULL,
  description TEXT,
  image_url TEXT,
  price_range TEXT,
  rating DECIMAL(2,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_salons_area ON salons(area);
CREATE INDEX idx_salons_specialties ON salons USING GIN(specialties);

-- Enable Row Level Security
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- Allow public reads
CREATE POLICY "Allow public reads" ON salons
  FOR SELECT
  USING (true);

-- ===================================
-- STEP 2: Insert Sample Salon Data
-- ===================================

INSERT INTO salons (name, location, area, phone, specialties, services, description, image_url, price_range, rating) VALUES

('Hair by Amara', 'Kilimani, Nairobi', 'Kilimani', '+254 712 345 678', 
 ARRAY['Type 4A', 'Type 4B', 'Type 4C', 'Natural Styles', 'Protective Styles'], 
 ARRAY['Box Braids', 'Twists', 'Cornrows', 'Locs Installation', 'Natural Hair Care', 'Deep Conditioning'],
 'Specialist in natural African hair care with 10+ years experience. We focus on healthy hair practices and beautiful protective styles.',
 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
 '$$', 4.8),

('Braiding Nairobi', 'Westlands, Nairobi', 'Westlands', '+254 723 456 789',
 ARRAY['Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Protective Styles', 'Braids'],
 ARRAY['Box Braids', 'Knotless Braids', 'Cornrows', 'Faux Locs', 'Passion Twists', 'Ghana Braids'],
 'Premier braiding salon specializing in all types of protective styles. Expert stylists trained in the latest techniques.',
 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=800',
 '$$$', 4.9),

('Natural Crown Studio', 'Karen, Nairobi', 'Karen', '+254 734 567 890',
 ARRAY['Type 3A', 'Type 3B', 'Type 3C', 'Type 4A', 'Natural Styles', 'Wash & Go'],
 ARRAY['Wash & Go', 'Twist Outs', 'Braid Outs', 'Silk Press', 'Deep Conditioning', 'Hair Treatments'],
 'We celebrate natural hair in all its glory. Specializing in wash and go styles, twist outs, and healthy hair maintenance.',
 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=800',
 '$$', 4.7),

('Locs & Love', 'South B, Nairobi', 'South B', '+254 745 678 901',
 ARRAY['Type 4A', 'Type 4B', 'Type 4C', 'Locs', 'Natural Styles'],
 ARRAY['Locs Installation', 'Locs Retwist', 'Locs Maintenance', 'Starter Locs', 'Faux Locs', 'Loc Extensions'],
 'Your go-to loc specialist in Nairobi. From starter locs to maintenance and styling, we do it all with care.',
 'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800',
 '$$', 4.6),

('Elegance Hair Lounge', 'Lavington, Nairobi', 'Lavington', '+254 756 789 012',
 ARRAY['Type 2A', 'Type 2B', 'Type 2C', 'Type 3A', 'Type 3B', 'Type 3C', 'Weaves', 'Extensions'],
 ARRAY['Sew-In Weaves', 'Clip-In Extensions', 'Wigs', 'Frontal Installation', 'Closure Installation', 'Hair Coloring'],
 'Full-service salon offering premium weaves, extensions, and styling. We work with all hair types.',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
 '$$$', 4.5),

('Twist & Shout', 'Ngong Road, Nairobi', 'Ngong Road', '+254 767 890 123',
 ARRAY['Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Twists', 'Protective Styles'],
 ARRAY['Senegalese Twists', 'Marley Twists', 'Passion Twists', 'Spring Twists', 'Havana Twists', 'Mini Twists'],
 'Twist specialists! We create beautiful, long-lasting twist styles that protect your natural hair.',
 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
 '$$', 4.8),

('Bantu Beauty Bar', 'Eastleigh, Nairobi', 'Eastleigh', '+254 778 901 234',
 ARRAY['Type 4A', 'Type 4B', 'Type 4C', 'Bantu Knots', 'Natural Styles'],
 ARRAY['Bantu Knots', 'Bantu Knot Outs', 'Cornrows', 'Braids', 'Natural Styling', 'Hair Treatments'],
 'Celebrating African hair artistry with traditional and modern styles. Specialists in Bantu knots and natural styling.',
 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
 '$', 4.7),

('Coils & Curls Collective', 'Parklands, Nairobi', 'Parklands', '+254 789 012 345',
 ARRAY['Type 2C', 'Type 3A', 'Type 3B', 'Type 3C', 'Curly Hair', 'Wash & Go'],
 ARRAY['DevaCut', 'Curly Cut', 'Wash & Go', 'Curl Defining', 'Deep Conditioning', 'Protein Treatments'],
 'Curly hair haven! We specialize in cutting and caring for curly and wavy hair textures.',
 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800',
 '$$', 4.6);

-- ===================================
-- STEP 3: Update Analytics Events Table
-- ===================================

-- Add product_name and salon_name columns (if not already added)
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS salon_name TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_name ON analytics_events(product_name);
CREATE INDEX IF NOT EXISTS idx_salon_name ON analytics_events(salon_name);

-- Verify the changes
SELECT 
  'Salons table created' as status,
  COUNT(*) as salon_count 
FROM salons;

