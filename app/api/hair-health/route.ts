import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | {
      type: 'image';
      source: { type: 'base64'; media_type: string; data: string };
    };

function isConnectTimeoutError(err: unknown): boolean {
  const anyErr = err as any;
  return (
    anyErr?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    anyErr?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    String(anyErr?.cause?.name ?? anyErr?.name ?? '').includes('ConnectTimeout')
  );
}

async function fetchAnthropicWithRetry(
  url: string,
  init: RequestInit,
  opts?: { timeoutMs?: number; retries?: number }
): Promise<Response> {
  const timeoutMs = opts?.timeoutMs ?? 30_000;
  const retries = opts?.retries ?? 1;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch (err) {
      const shouldRetry = attempt <= retries + 1 && isConnectTimeoutError(err);
      if (!shouldRetry) throw err;
      // small backoff before retry
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
}

function extractJsonFromText(text: string): unknown | null {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to salvage a JSON object from surrounding text.
    const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[1] || match[0]);
    } catch {
      return null;
    }
  }
}

function parseDataUrlImage(image: string): { mediaType: string; base64: string } | null {
  const m = String(image).match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!m) return null;
  const mediaType = m[1];
  const base64 = m[2];
  if (!mediaType || !base64) return null;
  return { mediaType, base64 };
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `Analyze this image for African hair health assessment.
Provide culturally appropriate recommendations considering protective styling, shrinkage, moisture retention, and common concerns like SSKs and breakage.

Return ONLY valid JSON (no commentary, no code fences, no markdown) in this exact schema:
{
  "curlPattern": { "type": "4a/4b/4c", "confidence": 0.0 },
  "porosity": "low/medium/high",
  "moistureLevel": "dry/balanced/well-moisturized",
  "proteinBalance": "needs protein/balanced/protein overload",
  "strandThickness": "fine/medium/coarse",
  "density": "low/medium/high",
  "length": "TWA/short/shoulder-length/APL/BSL",
  "scalpHealth": "dry/oily/balanced/flaky/irritated",
  "ssks": "none/minimal/moderate/severe",
  "splitEnds": "none/minimal/moderate/severe",
  "heatDamage": "none/minimal/moderate/severe",
  "chemicalProcessing": "virgin/texturized/colored/relaxed",
  "breakagePoints": ["crown", "edges", "ends", "nape"],
  "healthScore": 0,
  "recommendations": {
    "immediate": ["deep condition", "protein treatment"],
    "products": ["leave-in conditioner for high porosity"],
    "techniques": ["LOC method", "finger detangling"],
    "schedule": "Deep condition weekly, protein treatment monthly"
  }
}

If uncertain, use the closest category. Be specific about African hair characteristics like shrinkage, SSKs (single strand knots), and protective styling needs.`;

    const parsed = parseDataUrlImage(image);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image format',
          message: 'Expected a data URL like data:image/jpeg;base64,...',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Calling Anthropic Claude (vision) for hair health analysis...');

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: parsed.mediaType, data: parsed.base64 } },
          { type: 'text', text: prompt },
        ] satisfies AnthropicContentBlock[],
      },
    ];

    const res = await fetchAnthropicWithRetry(
      ANTHROPIC_MESSAGES_URL,
      {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1200,
        messages,
      }),
      },
      { timeoutMs: 30_000, retries: 1 }
    );

    const raw = await res.text();
    if (!res.ok) {
      let message = raw.slice(0, 800);
      try {
        const errJson = JSON.parse(raw) as { error?: { message?: string } };
        if (errJson?.error?.message) message = errJson.error.message;
      } catch {
        /* keep truncated body */
      }
      console.error('Hair-health Anthropic API error:', res.status, message);
      return NextResponse.json(
        { success: false, error: 'Hair health analysis failed', message },
        { status: 502 }
      );
    }

    let data: { content?: Array<{ type: string; text?: string }> };
    try {
      data = JSON.parse(raw) as { content?: Array<{ type: string; text?: string }> };
    } catch {
      console.error('Hair-health Anthropic API: invalid JSON response');
      return NextResponse.json(
        { success: false, error: 'Hair health analysis failed', message: 'Invalid response from AI provider' },
        { status: 502 }
      );
    }

    const assistantText = (data.content ?? [])
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text as string)
      .join('\n')
      .trim();

    const json = extractJsonFromText(assistantText);
    if (!json || typeof json !== 'object') {
      console.error('Hair-health: failed to parse JSON from assistant text:', assistantText.slice(0, 600));
      return NextResponse.json(
        { success: false, error: 'Hair health analysis failed', message: 'AI did not return valid JSON' },
        { status: 502 }
      );
    }

    // Basic normalization
    const normalized = json as any;
    if (normalized?.curlPattern?.type) {
      normalized.curlPattern.type = String(normalized.curlPattern.type).toLowerCase();
    }
    if (typeof normalized?.healthScore === 'number') {
      normalized.healthScore = Math.max(0, Math.min(100, Math.round(normalized.healthScore)));
    }

    return NextResponse.json({ success: true, data: normalized });
  } catch (error: any) {
    if (isConnectTimeoutError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hair health analysis unavailable',
          message: 'Timed out connecting to Anthropic. Please try again in a moment.',
        },
        { status: 503 }
      );
    }
    console.error('Hair-health analysis error:', error);
    return NextResponse.json({ success: false, error: 'Hair health analysis failed', message: error.message }, { status: 500 });
  }
}


