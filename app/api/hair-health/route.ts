import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
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

    console.log('🔍 Calling OpenAI GPT-4 Vision for comprehensive hair health analysis...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image, // OpenAI accepts data URLs directly
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" }, // Force JSON response
    });

    const text = response.choices[0].message.content || '';
    console.log('📥 OpenAI response received');

    let json: any;
    try {
      // OpenAI with json_object format should return valid JSON
      json = JSON.parse(text);
    } catch (parseError) {
      // Fallback: try to extract JSON if wrapped in markdown
      const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('Failed to parse OpenAI response:', text);
        return NextResponse.json({ success: false, error: 'Failed to parse OpenAI response' }, { status: 500 });
      }
      json = JSON.parse(match[1] || match[0]);
    }

    // Basic normalization
    if (json?.curlPattern?.type) {
      json.curlPattern.type = String(json.curlPattern.type).toLowerCase();
    }
    if (typeof json.healthScore === 'number') {
      json.healthScore = Math.max(0, Math.min(100, Math.round(json.healthScore)));
    }

    return NextResponse.json({ success: true, data: json });
  } catch (error: any) {
    console.error('Hair-health analysis error:', error);
    return NextResponse.json({ success: false, error: 'Hair health analysis failed', message: error.message }, { status: 500 });
  }
}


