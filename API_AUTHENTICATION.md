# Nywele.ai API Authentication

## Overview

The Nywele.ai API uses API key authentication to restrict access to external integrations while allowing your own frontend to access the endpoints freely.

## How It Works

### 1. Internal Requests (Your Frontend)

Your own Nywele.ai frontend can access all API endpoints without an API key. Requests from:

- `localhost` (development)
- `nywele.ai` domain (production)

These are automatically allowed.

### 2. External Requests (API Partners)

External services must include a valid API key in their requests.

## Authentication Methods

### Option 1: Custom Header (Recommended)

```bash
curl -X POST https://nywele.ai/api/analyze-image \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64-encoded-image"}'
```

### Option 2: Bearer Token

```bash
curl -X POST https://nywele.ai/api/analyze-image \
  -H "Authorization: Bearer your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64-encoded-image"}'
```

## Setup Instructions

### 1. Generate an API Key

```bash
# Generate a secure random API key (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Add to Environment Variables

```bash
# .env.local
NYWELE_API_KEY=your-generated-api-key-here
```

### 3. Protect Your API Routes

The authentication is automatically applied to protected routes. See the example below.

## Protected Endpoints

All API endpoints can be protected by adding the authentication check:

```typescript
import { requireAuth } from "@/lib/apiAuth";

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  // Your API logic here...
}
```

## Available API Endpoints

### 1. Hair Analysis API

**Endpoint:** `POST /api/analyze-image`

**Description:** Analyzes uploaded hair images to detect hair type, health, and styling needs.

**Request:**

```json
{
  "image": "base64-encoded-image-string",
  "imageType": "current-hair"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "hairType": {
      "hairType": "4C",
      "confidence": 0.85
    },
    "health": {
      "healthScore": 75,
      "concerns": ["dryness", "breakage"]
    }
  }
}
```

### 2. Routine Generation API

**Endpoint:** `POST /api/hair-care-routine`

**Description:** Generates personalised hair care routines with product recommendations.

**Request:**

```json
{
  "hairAnalysis": {
    "type": "4C",
    "health": "healthy",
    "porosity": "low"
  },
  "goals": ["growth", "moisture"],
  "lifestyle": {
    "budget": { "min": 1000, "max": 5000 }
  }
}
```

### 3. Style Detection API

**Endpoint:** `POST /api/analyze-style`

**Description:** Identifies hairstyles from uploaded photos.

**Request:**

```json
{
  "image": "base64-encoded-image-string"
}
```

### 4. Product Recommendations API

**Endpoint:** `POST /api/recommend`

**Description:** Provides AI-curated product recommendations.

## Security Best Practices

### 1. Keep API Keys Secret

- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly

### 2. Monitor Usage

- Log all API requests
- Track usage by API key
- Set rate limits

### 3. Use HTTPS Only

- All API requests must use HTTPS in production
- Never send API keys over HTTP

## Rate Limiting (Future Enhancement)

Consider implementing rate limiting for external API access:

```typescript
// Example rate limiting structure
const rateLimit = {
  free: 100, // requests per day
  basic: 1000, // requests per day
  premium: 10000, // requests per day
};
```

## Generating API Keys for Partners

When providing API access to partners:

1. Generate a unique key for each partner
2. Store keys in a database with metadata:

   - Partner name
   - Contact email
   - Usage tier
   - Creation date
   - Expiry date (optional)

3. Track usage per API key

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Valid API key required. Include x-api-key header or Authorization: Bearer token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Your API key does not have access to this resource"
}
```

## Contact

For API access inquiries, contact: api@nywele.ai

