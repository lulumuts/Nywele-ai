-- ===================================
-- OPTION 1: Using Supabase Storage URLs (Recommended)
-- Upload your images to Supabase Storage first, then use this
-- ===================================

-- First, delete sample salons if they exist
-- TRUNCATE TABLE salons;

INSERT INTO salons (name, location, area, phone, specialties, services, description, image_url, price_range, rating) VALUES

('Talebu', 'Westlands, Nairobi', 'Westlands', '+254 712 345 001', 
 ARRAY['Type 3A', 'Type 3B', 'Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Braids', 'Natural', 'Weave', 'Barber'], 
 ARRAY['Box Braids', 'Cornrows', 'Knotless Braids', 'Natural Hair Care', 'Wash & Go', 'Weave Installation', 'Sew-In Weaves', 'Barber Services', 'Fades', 'Lineups'],
 'Full-service salon offering braids, natural hair care, weaves, and barber services. Expert stylists for all hair types and styles.',
 'YOUR_SUPABASE_STORAGE_URL/Talebu.png',  -- Replace with actual Supabase Storage URL
 '$$', 4.7),

('Rapunzel', 'Kilimani, Nairobi', 'Kilimani', '+254 712 345 002',
 ARRAY['Type 3A', 'Type 3B', 'Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Braids', 'Weaves', 'Natural'],
 ARRAY['Box Braids', 'Ghana Braids', 'Cornrows', 'Sew-In Weaves', 'Frontal Installation', 'Natural Hair Care', 'Deep Conditioning'],
 'Specialized in braids, weaves, and natural hair care. Affordable pricing with expert stylists.',
 'YOUR_SUPABASE_STORAGE_URL/Rapunzel.png',
 '$', 4.5),

('Divas Beauty', 'Westlands, Nairobi', 'Westlands', '+254 712 345 003',
 ARRAY['Type 2A', 'Type 2B', 'Type 2C', 'Type 3A', 'Type 3B', 'Type 3C', 'Wigs', 'Weaves'],
 ARRAY['Custom Wigs', 'Wig Installation', 'Lace Frontal', 'Closure Installation', 'Sew-In Weaves', 'Clip-In Extensions', 'Wig Styling'],
 'Premium salon specializing in high-end wigs and weaves. Expert wig customization and styling.',
 'YOUR_SUPABASE_STORAGE_URL/Divas.png',
 '$$$', 4.9),

('Mizani', 'Village Market, Nairobi', 'Village Market', '+254 712 345 004',
 ARRAY['Type 2A', 'Type 2B', 'Type 2C', 'Type 3A', 'Type 3B', 'Type 3C', 'Wigs', 'Weaves'],
 ARRAY['Wig Installation', 'Custom Wigs', 'Lace Frontal', 'Weave Installation', 'Sew-In Weaves', 'Hair Coloring', 'Wig Maintenance'],
 'Professional wig and weave specialists located at Village Market. Quality installations and styling.',
 'YOUR_SUPABASE_STORAGE_URL/Mizani.png',
 '$$', 4.6),

('Olurin Beauty', 'Langata, Nairobi', 'Langata', '+254 712 345 005',
 ARRAY['Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Natural', 'Barber'],
 ARRAY['Natural Hair Care', 'Wash & Go', 'Twist Outs', 'Bantu Knots', 'Deep Conditioning', 'Barber Services', 'Fades', 'Beard Grooming'],
 'Natural hair care specialists and barber services. Expert in maintaining healthy natural hair and fresh cuts.',
 'YOUR_SUPABASE_STORAGE_URL/Olurin.png',
 '$', 4.4),

('MC3', 'Kilimani, Nairobi', 'Kilimani', '+254 712 345 006',
 ARRAY['Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Braids', 'Wigs', 'Natural'],
 ARRAY['Box Braids', 'Knotless Braids', 'Ghana Braids', 'Wig Installation', 'Custom Wigs', 'Natural Hair Care', 'Twist Outs'],
 'Versatile salon offering braids, wigs, and natural hair care. Affordable pricing with skilled stylists.',
 'YOUR_SUPABASE_STORAGE_URL/MC3.png',
 '$', 4.5);

-- ===================================
-- OPTION 2: Using placeholder images (Quick Start)
-- Use Unsplash placeholders until you upload your images
-- ===================================

-- TRUNCATE TABLE salons;

INSERT INTO salons (name, location, area, phone, specialties, services, description, image_url, price_range, rating) VALUES

('Talebu', 'Westlands, Nairobi', 'Westlands', '+254 712 345 001', 
 ARRAY['Type 3A', 'Type 3B', 'Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Braids', 'Natural', 'Weave', 'Barber'], 
 ARRAY['Box Braids', 'Cornrows', 'Knotless Braids', 'Natural Hair Care', 'Wash & Go', 'Weave Installation', 'Sew-In Weaves', 'Barber Services', 'Fades', 'Lineups'],
 'Full-service salon offering braids, natural hair care, weaves, and barber services. Expert stylists for all hair types and styles.',
 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
 '$$', 4.7),

('Rapunzel', 'Kilimani, Nairobi', 'Kilimani', '+254 712 345 002',
 ARRAY['Type 3A', 'Type 3B', 'Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Braids', 'Weaves', 'Natural'],
 ARRAY['Box Braids', 'Ghana Braids', 'Cornrows', 'Sew-In Weaves', 'Frontal Installation', 'Natural Hair Care', 'Deep Conditioning'],
 'Specialized in braids, weaves, and natural hair care. Affordable pricing with expert stylists.',
 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=800',
 '$', 4.5),

('Divas Beauty', 'Westlands, Nairobi', 'Westlands', '+254 712 345 003',
 ARRAY['Type 2A', 'Type 2B', 'Type 2C', 'Type 3A', 'Type 3B', 'Type 3C', 'Wigs', 'Weaves'],
 ARRAY['Custom Wigs', 'Wig Installation', 'Lace Frontal', 'Closure Installation', 'Sew-In Weaves', 'Clip-In Extensions', 'Wig Styling'],
 'Premium salon specializing in high-end wigs and weaves. Expert wig customization and styling.',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
 '$$$', 4.9),

('Mizani', 'Village Market, Nairobi', 'Village Market', '+254 712 345 004',
 ARRAY['Type 2A', 'Type 2B', 'Type 2C', 'Type 3A', 'Type 3B', 'Type 3C', 'Wigs', 'Weaves'],
 ARRAY['Wig Installation', 'Custom Wigs', 'Lace Frontal', 'Weave Installation', 'Sew-In Weaves', 'Hair Coloring', 'Wig Maintenance'],
 'Professional wig and weave specialists located at Village Market. Quality installations and styling.',
 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
 '$$', 4.6),

('Olurin Beauty', 'Langata, Nairobi', 'Langata', '+254 712 345 005',
 ARRAY['Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Natural', 'Barber'],
 ARRAY['Natural Hair Care', 'Wash & Go', 'Twist Outs', 'Bantu Knots', 'Deep Conditioning', 'Barber Services', 'Fades', 'Beard Grooming'],
 'Natural hair care specialists and barber services. Expert in maintaining healthy natural hair and fresh cuts.',
 'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800',
 '$', 4.4),

('MC3', 'Kilimani, Nairobi', 'Kilimani', '+254 712 345 006',
 ARRAY['Type 3C', 'Type 4A', 'Type 4B', 'Type 4C', 'Braids', 'Wigs', 'Natural'],
 ARRAY['Box Braids', 'Knotless Braids', 'Ghana Braids', 'Wig Installation', 'Custom Wigs', 'Natural Hair Care', 'Twist Outs'],
 'Versatile salon offering braids, wigs, and natural hair care. Affordable pricing with skilled stylists.',
 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
 '$', 4.5);

-- ===================================
-- To Upload Images to Supabase Storage:
-- ===================================

-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a bucket called "salon-images" (make it public)
-- 3. Upload your images: Talebu.png, Rapunzel.png, Divas.png, Mizani.png, Olurin.png, MC3.png
-- 4. Get public URLs for each image
-- 5. Run OPTION 1 above with the actual URLs

-- Public URL format will be:
-- https://[your-project].supabase.co/storage/v1/object/public/salon-images/Talebu.png

-- ===================================
-- Verify the data
-- ===================================

SELECT name, area, price_range, rating, 
       array_length(services, 1) as service_count
FROM salons
ORDER BY rating DESC;

