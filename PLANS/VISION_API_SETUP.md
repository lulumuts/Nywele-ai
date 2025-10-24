# Google Vision API Setup Guide

## What it Does

Google Vision API analyzes uploaded hair photos to:

- **Detect hair type** (4a, 4b, 4c) automatically
- **Identify hairstyles** (braids, locs, twists, etc.)
- **Analyze hair health** (shine, condition, health score)
- **Extract colors** (dominant hair colors)
- **Detect labels** (texture, style characteristics)

## Setup Options

### Option 1: API Key (Recommended for Development)

**Pros**: Simple, fast setup
**Cons**: Limited to 1000 requests/day (free tier)

#### Steps:

1. **Enable Vision API**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project (or select existing)
   - Enable "Cloud Vision API"

2. **Create API Key**

   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key

3. **Add to Environment**

   ```bash
   # Create .env.local file
   echo "GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here" >> .env.local
   ```

4. **Restrict API Key (Important!)**
   - In Google Cloud Console, click on your API key
   - Add restrictions:
     - **API restrictions**: Select "Cloud Vision API" only
     - **Application restrictions**: HTTP referrers (add your domain)

### Option 2: Service Account (Recommended for Production)

**Pros**: No rate limits, more secure
**Cons**: More setup steps

#### Steps:

1. **Create Service Account**

   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `nywele-vision-api`
   - Grant role: "Cloud Vision API User"

2. **Generate Key**

   - Click on service account
   - Go to "Keys" → "Add Key" → "Create new key"
   - Choose JSON format
   - Download the JSON file

3. **Add to Project**

   ```bash
   # Move JSON file to project root
   mv ~/Downloads/nywele-vision-api-*.json ./google-credentials.json

   # Add to .gitignore (IMPORTANT!)
   echo "google-credentials.json" >> .gitignore

   # Set environment variable
   echo "GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json" >> .env.local
   ```

## Testing

### Test with curl

```bash
# Convert image to base64
base64 -i /path/to/hair-photo.jpg | pbcopy

# Test API (paste base64 as IMAGE_BASE64)
curl -X POST http://localhost:3000/api/analyze-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "IMAGE_BASE64",
    "imageType": "current_hair"
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "hairType": {
      "hairType": "4c",
      "confidence": 0.87
    },
    "detectedStyle": {
      "style": "box-braids",
      "confidence": 0.92
    },
    "health": {
      "healthScore": 75,
      "indicators": ["shiny", "well-groomed"]
    },
    "labels": [
      { "name": "Hair", "confidence": 98 },
      { "name": "Braid", "confidence": 92 },
      { "name": "Black hair", "confidence": 89 }
    ],
    "colors": [
      { "color": { "red": 20, "green": 15, "blue": 10 }, "score": 0.45 }
    ],
    "hasFace": true
  }
}
```

## Integration Examples

### In Booking Flow

```typescript
// When user uploads current hair photo
const analyzeCurrentHair = async (imageBase64: string) => {
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: imageBase64,
      imageType: "current_hair",
    }),
  });

  const { data } = await response.json();

  // Use detected hair type
  console.log("Detected hair type:", data.hairType?.hairType);

  // Show health insights
  console.log("Hair health score:", data.health.healthScore);
};
```

### In Inspiration Photo Upload

```typescript
// When user uploads inspiration photo
const analyzeInspiration = async (imageBase64: string) => {
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: imageBase64,
      imageType: "inspiration",
    }),
  });

  const { data } = await response.json();

  // Match to existing styles
  if (data.detectedStyle) {
    console.log("Detected style:", data.detectedStyle.style);
    // Redirect to booking flow with style pre-selected
  }
};
```

## Cost

### Free Tier (First 1000 requests/month)

- **Cost**: $0
- **Perfect for**: Development, testing, MVP

### Paid Tier (After 1000 requests)

- **Cost**: $1.50 per 1000 images
- **Example**: 10,000 images/month = $15/month

### Optimization Tips

1. Only analyze when user explicitly uploads
2. Cache results in localStorage
3. Don't re-analyze same image
4. Use lower quality for preview (faster + cheaper)

## Troubleshooting

### "Vision API not configured"

**Fix**: Add `GOOGLE_CLOUD_VISION_API_KEY` to `.env.local`

### "API key not valid"

**Fix**:

1. Check key is correct (no extra spaces)
2. Enable Cloud Vision API in Google Cloud Console
3. Check API key restrictions

### "Permission denied"

**Fix** (Service Account):

1. Ensure service account has "Cloud Vision API User" role
2. Check JSON file path is correct
3. Verify JSON file has proper permissions

### "Rate limit exceeded"

**Fix**:

1. Upgrade to paid tier ($1.50/1000 images)
2. Or use service account (no rate limits)

## Security Best Practices

1. ✅ **Never commit** API keys or JSON credentials
2. ✅ **Restrict API keys** to specific APIs and domains
3. ✅ **Use environment variables** for all credentials
4. ✅ **Add to .gitignore**: `.env.local`, `google-credentials.json`
5. ✅ **Rotate keys** if accidentally exposed

## Next Steps

After setup:

1. Test with sample image
2. Integrate into booking flow (upload handler)
3. Display detected hair type to user
4. Use insights for smart style recommendations
5. Track analytics on detection accuracy

---

**Ready to test**: Upload a hair photo and check the console for analysis results! 🎉
