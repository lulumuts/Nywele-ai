import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '@/lib/apiAuth';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { image, imageType } = body;

    // Validation
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI is configured
    if (!openai) {
      console.log('⚠️ OpenAI API not configured, returning default analysis');
      return NextResponse.json({
        success: true,
        data: {
          hairType: { hairType: '4c', confidence: 50 },
          detectedStyle: { style: 'Natural', confidence: 50 },
          health: { healthScore: 75, indicators: [] },
          labels: [],
          colors: [],
          hasFace: false,
          imageType: imageType || 'unknown',
          analyzedAt: new Date().toISOString(),
          note: 'OpenAI API not configured - using defaults'
        }
      });
    }

    console.log(`🔍 Analyzing ${imageType || 'unknown'} image with OpenAI GPT-4o Vision...`);

    const prompt = `Analyze this hair image and provide detailed information about:

1. Hair Type/Texture (using Andre Walker system):
   - Type 4a: S-shaped coils, defined curl pattern
   - Type 4b: Z-shaped coils, less defined pattern
   - Type 4c: Tightly coiled, zigzag pattern, most shrinkage
   
2. Hair Health Indicators:
   - Overall health score (0-100)
   - Signs of damage, dryness, or breakage
   - Shine and moisture level
   
3. Hair Characteristics:
   - Density (low/medium/high)
   - Porosity indicators
   - Length
   - Current style (if visible)

Respond in JSON format with:
{
  "hairType": "4a" | "4b" | "4c",
  "confidence": number (0-100),
  "health": {
    "healthScore": number (0-100),
    "indicators": ["indicator1", "indicator2"],
    "moisture": "low" | "medium" | "high",
    "damage": "none" | "slight" | "moderate" | "severe"
  },
  "characteristics": {
    "density": "low" | "medium" | "high",
    "porosity": "low" | "medium" | "high",
    "length": string,
    "currentStyle": string
  },
  "description": "detailed description of what you observe"
}`;

    console.log('📤 Sending image to OpenAI for hair texture analysis...');
    
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
                url: image,
                detail: "high" // Use high detail for better texture analysis
              },
            },
          ],
        },
      ],
      max_tokens: 800,
    });

    console.log('📥 Received response from OpenAI');
    const text = response.choices[0].message.content || '';
    console.log('📝 Response preview:', text.substring(0, 150));
    
    // Parse JSON from response
    let analysisData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      analysisData = JSON.parse(jsonText);
      console.log('✅ Successfully parsed hair analysis');
    } catch (parseError) {
      console.warn('⚠️ Failed to parse OpenAI response, using fallback');
      // Fallback: extract what we can from text
      const hairTypeMatch = text.match(/hair type[:\s]*(4[abc])/i);
      analysisData = {
        hairType: hairTypeMatch ? hairTypeMatch[1] : '4c',
        confidence: 60,
        health: {
          healthScore: 70,
          indicators: ['Analysis in progress'],
          moisture: 'medium',
          damage: 'slight'
        },
        characteristics: {
          density: 'medium',
          porosity: 'medium',
          length: 'medium',
          currentStyle: 'Natural'
        },
        description: text.substring(0, 200)
      };
    }

    // Log the detected hair type for debugging
    console.log('✅ Hair Analysis Complete:');
    console.log(`   Hair Type: ${analysisData.hairType} (${analysisData.confidence}% confidence)`);
    console.log(`   Health Score: ${analysisData.health?.healthScore || 'N/A'}`);
    console.log(`   Density: ${analysisData.characteristics?.density || 'N/A'}`);

    return NextResponse.json({
      success: true,
      data: {
        hairType: { 
          hairType: analysisData.hairType,
          confidence: analysisData.confidence 
        },
        detectedStyle: { 
          style: analysisData.characteristics?.currentStyle || 'Natural',
          confidence: analysisData.confidence 
        },
        health: {
          healthScore: analysisData.health?.healthScore || 75,
          indicators: analysisData.health?.indicators || [],
          moisture: analysisData.health?.moisture || 'medium',
          damage: analysisData.health?.damage || 'none'
        },
        characteristics: analysisData.characteristics || {},
        description: analysisData.description,
        labels: [],
        colors: [],
        hasFace: false,
        imageType: imageType || 'unknown',
        analyzedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('❌ Hair texture analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze hair texture',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
