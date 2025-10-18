# 🪮 Nywele.ai — Hackathon Setup Guide

## 🎯 Project Overview

Nywele.ai is an **AI-powered hair care and styling recommendation engine** designed for African hair.  
It combines **GPT-4o**, **Gemini**, **Supabase**, and **Convex** to generate personalized routines, AI-generated visuals, and product recommendations (affiliate-ready).

This guide configures the project for:

- Local development in **Cursor**
- Hosting on **Vercel**
- Integration with **Supabase** and **Convex**
- Connection to **Lovable.dev** for UI

---

## 🧱 1. Initialize Project

In Cursor Terminal:

```bash
npx create-next-app@latest nywele-ai
cd nywele-ai
```

Choose:

- ✅ TypeScript
- ✅ App Router
- ✅ TailwindCSS

---

## 📦 2. Install Dependencies

```bash
npm install openai @google/generative-ai @supabase/supabase-js convex dotenv axios
```

---

## 📂 3. Project Structure

```
nywele-ai/
├── app/
│   ├── page.tsx
│   ├── api/
│   │   ├── recommend/route.ts
│   │   ├── style/route.ts
│   │   ├── products/route.ts
│   │   └── analytics/route.ts
├── lib/
│   ├── openai.ts
│   ├── gemini.ts
│   ├── supabase.ts
│   └── convex.ts
├── .env.local
├── package.json
└── README.md
```

---

## 🔐 4. Environment Variables

Create `.env.local` in project root:

```
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
CONVEX_DEPLOYMENT=your_convex_url
```

---

## ⚙️ 5. API Routes

### `app/api/recommend/route.ts`

Generates personalized routines using **GPT-4o**.

```ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { profile } = await req.json();

  const { data: products } = await supabase.from("products").select("*");

  const prompt = `
You are an African haircare expert.
Profile:
Hair Type: ${profile.hairType}
Goals: ${profile.goals.join(", ")}
Current Style: ${profile.currentStyle}
Duration Preference: ${profile.durationPreference}

Generate:
1. 3–5 care steps
2. Style duration
3. Product suggestions (from ${products.map((p) => p.name).join(", ")})
4. A short stylist tip.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return NextResponse.json({
    routine: completion.choices[0].message.content,
    products,
  });
}
```

---

### `app/api/style/route.ts`

Generates hairstyle visuals using **Gemini Flash**.

```ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { hairType, currentStyle } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateImage({
    prompt: `Generate a high-quality image of a person with ${hairType} hair in a ${currentStyle} style.`,
  });

  return NextResponse.json({ image: result.response.image });
}
```

---

## 🧩 6. Library Connections

### `lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

### `lib/convex.ts`

```ts
import { ConvexClient } from "convex/browser";
export const convex = new ConvexClient(process.env.CONVEX_DEPLOYMENT!);
```

---

## 🧠 7. Supabase Schema

**Table: `users`**
| Column | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| hair_type | text | e.g. "4c" |
| goals | text[] | e.g. ["growth", "hydration"] |
| current_style | text | e.g. "box braids" |

**Table: `products`**
| Column | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| name | text | e.g. "Darling Shea Butter" |
| brand | text | e.g. "Darling" |
| affiliate_link | text | monetization |
| compatible_styles | text[] | e.g. ["braids", "twists"] |
| sponsored | boolean | true/false |

---

## ☁️ 8. Deploy to Vercel

1. Push repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the GitHub repo.
4. Set the environment variables:
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `CONVEX_DEPLOYMENT`
5. Deploy 🚀

After deployment, test:

```
POST https://nywele-ai.vercel.app/api/recommend
```

---

## 💅 9. Connect Lovable.dev Frontend

In Lovable:

- Set API base URLs to:
  - `https://nywele-ai.vercel.app/api/recommend`
  - `https://nywele-ai.vercel.app/api/style`
- Build your form → results → product flow.

---

## 🏁 10. Verify Before Hackathon Demo

- ✅ `/api/recommend` returns routines + product matches
- ✅ `/api/style` returns image URLs
- ✅ Supabase shows stored users/products
- ✅ Convex logs recommendations
- ✅ Lovable frontend communicates successfully

---

### 💡 Optional Enhancements

| Feature          | API           | Tool       |
| ---------------- | ------------- | ---------- |
| Hair detection   | `/api/detect` | Fal.ai     |
| Trend insights   | `/api/trends` | Exa.ai     |
| Voice narration  | `/api/voice`  | ElevenLabs |
| Long-term memory | `/api/mem`    | Mem0       |

---

**You’re ready to deploy, test, and pitch.**
Focus your build on:  
➡ Profile → Routine → Visual → Product flow

That end-to-end loop will _win the demo._
