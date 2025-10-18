# Convex Setup Guide

## Current Status
✅ Convex schema and analytics functions are created
✅ Build is working (tracking calls are commented out)
⏸️ Waiting for initialization

## To Activate Convex (10 minutes)

### 1. Initialize Convex
```bash
cd /Users/lulumutuli/Documents/nywele-ai
npx convex dev
```

This will:
- Prompt you to login/create a Convex account
- Create a new project
- Generate the `convex/_generated` folder
- Give you a deployment URL

### 2. Add Environment Variable
After running `npx convex dev`, you'll get a URL like:
```
https://your-project.convex.cloud
```

Add it to `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 3. Uncomment Tracking Calls
In these files, uncomment the lines marked with "Uncomment after running `npx convex dev`":

1. `app/api/recommend/route.ts` (line 4 import + lines 173-183)
2. `app/api/style/route.ts` (line 4 import + lines 70-78 and 113-121)

### 4. Test Locally
```bash
npm run dev
```

Fill out the form and check console for:
```
[Convex] Tracked recommendation
[Convex] Tracked style generation
```

### 5. Deploy
```bash
git add -A
git commit -m "Activate Convex analytics"
git push origin main
```

Vercel will automatically add the `NEXT_PUBLIC_CONVEX_URL` to production if you set it in your local `.env.local`.

## What Convex Tracks

- **Recommendations:** Hair type, porosity, concerns, goals, desired style
- **Style Generations:** Success/failure rate, style types, ethnicity, length preferences
- **Analytics:** Real-time stats on usage patterns

## Future Enhancements

Once active, you can:
- Create an analytics dashboard at `/app/analytics/page.tsx`
- Query stats using `getRecommendationStats` from `convex/analytics.ts`
- Track user retention and popular styles

## Why Convex?

- Real-time data sync (no polling needed)
- Serverless (no infrastructure management)
- Perfect for hackathon demos showing live usage stats
- Scales automatically

