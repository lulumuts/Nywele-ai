# Convex Analytics Setup

## Why Convex?

Convex provides real-time analytics for tracking:

- User recommendation requests
- Style generation success rates
- Popular hair types and styles
- User interaction patterns

## Setup Instructions

### 1. Initialize Convex (One-time setup)

```bash
npx convex dev
```

This will:

- Prompt you to log in to Convex
- Create a new project or link to existing one
- Generate `convex/_generated` directory
- Create `.env.local` entries for `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`

### 2. Environment Variables

After running `npx convex dev`, add to `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-name
```

### 3. Deploy Schema

```bash
npx convex deploy
```

## Schema

### Tables

1. **recommendations** - Tracks hair care recommendation requests
   - `hairType`: User's hair type (1a-4c)
   - `goals`: Array of hair goals
   - `ethnicity`: User's ethnicity
   - `length`: Hair length
   - `timestamp`: Request time

2. **styleGenerations** - Tracks AI image generation attempts
   - `hairType`, `style`, `ethnicity`, `length`, `vibe`
   - `success`: Whether generation succeeded
   - `timestamp`: Generation time

3. **analytics** - Generic event tracking
   - `eventType`: Type of event
   - `metadata`: Additional event data
   - `timestamp`: Event time

## Usage

See `/Users/lulumutuli/Documents/nywele-ai/lib/convex.ts` for client configuration.

## Hackathon Note

If you don't have time to fully set up Convex, the schema and functions are ready to demonstrate:

- Multi-service integration
- Real-time analytics capability
- Production-ready architecture

The app works without Convex - it's an enhancement for the sponsor prize.
