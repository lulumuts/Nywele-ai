# Supabase Image Setup for Kinyozi Salons

## Quick Option (5 minutes) - Use Placeholder Images

1. Open Supabase SQL Editor
2. Run **OPTION 2** from `INSERT_KINYOZI_SALONS.sql`
3. Done! Salons will show with Unsplash placeholder images

---

## Full Option (15 minutes) - Upload Your Actual Images

### Step 1: Create Storage Bucket (2 min)

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name it: `salon-images`
4. **Make it public** ✓
5. Click **Create bucket**

### Step 2: Upload Your Images (3 min)

1. Click on the `salon-images` bucket
2. Click **Upload file**
3. Upload these 6 images from your Kinyozi project:
   - `Talebu.png`
   - `Rapunzel.png`
   - `Divas.png`
   - `Mizani.png`
   - `Olurin.png`
   - `MC3.png`

### Step 3: Get Public URLs (5 min)

For each uploaded image:
1. Click the **•••** menu next to the image
2. Click **Get URL**
3. Copy the public URL

Your URLs will look like:
```
https://[your-project-id].supabase.co/storage/v1/object/public/salon-images/Talebu.png
```

### Step 4: Update SQL and Run (5 min)

1. Open `INSERT_KINYOZI_SALONS.sql`
2. In **OPTION 1**, replace `YOUR_SUPABASE_STORAGE_URL/[filename]` with actual URLs:
   ```sql
   -- Example:
   'https://abcdefgh.supabase.co/storage/v1/object/public/salon-images/Talebu.png'
   ```
3. Go to Supabase SQL Editor
4. Run the modified **OPTION 1** SQL
5. Done!

---

## Alternative: Copy Images from Job Hunt Folder

Your images are in: `/Users/lulumutuli/Documents/job hunt/img/`

1. Navigate to that folder
2. Find: `Talebu.png`, `Rapunzel.png`, `Divas.png`, `Mizani.png`, `Olurin.png`, `MC3.png`
3. Upload to Supabase Storage as described above

---

## Verify It Worked

Run this in Supabase SQL Editor:
```sql
SELECT name, image_url FROM salons;
```

You should see 6 salons with their image URLs.

---

## For Demo: Quick Start

**Recommended for hackathon speed:**
- Use **OPTION 2** (Unsplash placeholders) now
- Get the app working immediately
- Upload real images later if time permits

The filtering by styles will work either way! 🚀

