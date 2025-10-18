# Supabase Analytics Setup (5 minutes)

## Step 1: Create Analytics Table

Go to your Supabase dashboard → SQL Editor → New Query

Paste and run this SQL:

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  hair_type TEXT,
  porosity TEXT,
  concerns TEXT[],
  style TEXT,
  success BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_event_type ON analytics_events(event_type);
CREATE INDEX idx_hair_type ON analytics_events(hair_type);
CREATE INDEX idx_created_at ON analytics_events(created_at DESC);

-- Enable Row Level Security (optional for hackathon, but good practice)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from your app (using service role key)
CREATE POLICY "Allow service role inserts" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Allow reads from your app
CREATE POLICY "Allow reads" ON analytics_events
  FOR SELECT
  USING (true);
```

## Step 2: Test Locally

```bash
npm run dev
```

Fill out the form and submit. Check your terminal for:
```
[Analytics] ✅ Tracked recommendation
[Analytics] ✅ Tracked style generation (fallback)
```

## Step 3: View Data

Go to Supabase dashboard → Table Editor → `analytics_events`

You should see your tracked events!

## Step 4: View Analytics Dashboard

Once you have some data, visit:
```
http://localhost:3000/analytics
```

You'll see:
- Total recommendations
- Style generation attempts
- AI success rate
- Popular hair types
- Popular styles
- Recent activity

## What Gets Tracked

### Recommendation Events
- Hair type
- Porosity
- Concerns
- Desired style
- Goals, ethnicity, length (in metadata)

### Style Generation Events
- Hair type
- Style
- Success (AI vs fallback)
- Ethnicity, length, vibe (in metadata)

## Production Deploy

Your Supabase credentials are already in `.env.local` and will work in production on Vercel!

No additional setup needed ✨

