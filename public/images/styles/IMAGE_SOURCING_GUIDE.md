# Image Sourcing Guide for Nywele.ai

## Current Status

- 21 local images (basic coverage)
- Goal: 100+ authentic, high-quality images

## Sourcing Strategy

### 1. Free Stock Photos (Immediate)

**Unsplash** (unsplash.com)

- Search: "Black woman braids", "4C hair", "African hairstyle"
- Filter: Black models, high resolution
- Download and add to `/public/images/styles/`
- Credit in `imageLibrary.ts`

**Pexels** (pexels.com)

- Similar search strategy
- Free for commercial use
- Attribute photographer

### 2. Instagram (Community Building)

**Process:**

1. Find Black hair influencers/stylists
2. Request permission to feature their work
3. Offer:
   - Free listing in Stylist Directory
   - Attribution with link to their profile
   - Exposure to your user base

**Target Accounts:**

- @naturalhairmag
- @blackhairinfo
- @voiceofhair
- Local stylists in your area

### 3. User-Submitted Photos (Long-term)

- Add "Share Your Results" feature
- Clear consent form
- Reward: Featured in gallery, discount codes
- Tag: hair type, products, stylist

## Image Requirements

### Technical:

- Min resolution: 1200x1600px
- Format: JPG (optimized)
- File size: <500KB
- Aspect ratio: 3:4 or 4:5

### Content:

- Focus on hairstyle (back/side view preferred)
- Clear lighting
- Authentic African/Black woman
- Professional quality
- Various hair types (4A, 4B, 4C priority)

## Priority Styles to Add (50+ images needed)

**Protective Styles:**

- Passion Twists (need 5 angles)
- Feed-in Braids (need 5 angles)
- Knotless Braids (need 5 angles)
- Goddess Locs (need 5 angles)
- Crochet Braids (various textures)

**Natural Styles:**

- Wash and Go (4A, 4B, 4C)
- High Puff (various sizes)
- Finger Coils (different lengths)
- Braid Out (various patterns)

**Low Manipulation:**

- Mini Twists (need more)
- Flat Twists (updos and down)
- Halo Braid
- Crown Braid

## File Naming Convention

```
{style-name}-{hair-type}-{length}-{angle}-{number}.jpg

Examples:
box-braids-4c-long-back-01.jpg
twist-out-4b-medium-side-02.jpg
afro-4a-short-front-01.jpg
```

## Adding to Image Library

1. Add image to `/public/images/styles/`
2. Update `lib/imageLibrary.ts`:

```typescript
{
  url: '/images/styles/new-style.jpg',
  source: 'local' | 'unsplash' | 'instagram',
  attribution: 'Photo by @username',
  hairTypes: ['4a', '4b', '4c'],
  length: 'short' | 'medium' | 'long',
  angle: 'back' | 'side' | 'front' | 'top',
  quality: 'high'
}
```

## Legal Considerations

- **Unsplash/Pexels:** Free, but credit photographer
- **Instagram:** Must get explicit permission
- **User-submitted:** Need signed consent form
- Keep records of all permissions

## Budget for Licensed Images (Optional)

- **Shutterstock Black:** ~$30/image
- **Getty Images:** ~$50/image
- Consider for hero images/marketing



