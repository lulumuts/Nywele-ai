# API inventory (Next.js `app/api/**`)

This project uses Next.js Route Handlers under `app/api/**/route.ts`.

## Endpoints

### `POST /api/recommend`

- **Route**: `app/api/recommend/route.ts`
- **Called by**:
  - `app/dashboard/page.tsx` (AI-Powered Recommendations)
  - `app/style-advisor/page.tsx` (currently used by “Preview Style Inspiration”, but this is the wrong endpoint for “style visuals”)
- **Requires**:
  - `OPENAI_API_KEY` (server)
  - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (server + client creation)
  - `NYWELE_API_KEY` (only if treated as “external” by `lib/apiAuth.ts`)
- **Current failure behavior**:
  - Returns **500** if either OpenAI or Supabase client isn’t configured.

### `POST /api/style`

- **Route**: `app/api/style/route.ts`
- **Called by**:
  - `app/results/page.tsx` (style inspiration)
  - `app/style-check/[slug]/page.tsx` (Generate style inspiration)
- **Requires**:
  - `GEMINI_API_KEY` (optional; without it the route still responds but falls back to curated images)
  - `NYWELE_API_KEY` (only if treated as “external” by `lib/apiAuth.ts`)
- **Current failure behavior**:
  - Usually succeeds via curated image fallback; can return **500** on unhandled exceptions.

### `GET /api/styles`

- **Route**: `app/api/styles/route.ts`
- **Called by**:
  - `app/style-check/page.tsx` (library list; falls back to hardcoded styles when empty)
- **Requires**:
  - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Current failure behavior**:
  - Returns `{ styles: [] }` on error (frontend uses fallback list).

### `GET /api/products`

- **Route**: `app/api/products/route.ts`
- **Called by**:
  - Not directly from the pages scanned in this pass (catalog code may call it indirectly / later).
- **Requires**:
  - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Supabase-backed catalog
- **Current failure behavior**:
  - Returns status **200** and falls back to mock catalog when Supabase is unavailable/empty.

### `POST /api/analyze-image`

- **Route**: `app/api/analyze-image/route.ts`
- **Called by**:
  - `app/hair-care/page.tsx` (photo analysis)
- **Requires** (one of):
  - `GOOGLE_APPLICATION_CREDENTIALS` (service account json path), or
  - `GOOGLE_CLOUD_VISION_API_KEY`
- **Also uses**:
  - `NYWELE_API_KEY` (only if treated as “external” by `lib/apiAuth.ts`)
- **Current failure behavior**:
  - Returns **503** when Vision isn’t configured.

### `POST /api/hair-health`

- **Route**: `app/api/hair-health/route.ts`
- **Called by**:
  - `app/hair-care/page.tsx` (secondary “Gemini hair-health” naming in UI, but it’s OpenAI-powered)
- **Requires**:
  - `OPENAI_API_KEY`
  - `NYWELE_API_KEY` (only if treated as “external” by `lib/apiAuth.ts`)
- **Current failure behavior**:
  - Returns **500** if `OPENAI_API_KEY` isn’t configured.

### `POST /api/analyze-style`

- **Route**: `app/api/analyze-style/route.ts`
- **Called by**:
  - `app/style-advisor/page.tsx` (upload desired style image)
  - `app/booking-flow/page.tsx` (upload desired style image)
- **Requires**:
  - `OPENAI_API_KEY`
  - `NYWELE_API_KEY` (only if treated as “external” by `lib/apiAuth.ts`)
- **Current failure behavior**:
  - Returns **500** if `OPENAI_API_KEY` isn’t configured.

### `POST /api/hair-care-routine`

- **Route**: `app/api/hair-care-routine/route.ts`
- **Called by**:
  - `app/hair-care/page.tsx` (Generate My Routine)
- **Requires**:
  - `NYWELE_API_KEY` (only if treated as “external” by `lib/apiAuth.ts`)
- **Optional**:
  - Supabase keys: product selection will use Supabase if available, otherwise may degrade/fallback via product library.
- **Current failure behavior**:
  - Returns **400** if `hairAnalysis` is missing.

