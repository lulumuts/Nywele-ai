import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '@/lib/apiAuth';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  console.log('🔍 Analyze-style API called');
  
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) {
    console.log('❌ Auth failed');
    return authError;
  }
  console.log('✅ Auth passed');

  try {
    if (!openai) {
      console.error('❌ OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'OpenAI API not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 500 }
      );
    }
    console.log('✅ OpenAI initialized');

    const { image } = await request.json();
    
    if (!image) {
      console.error('❌ No image in request body');
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    console.log('✅ Image received, length:', image.length);

    const prompt = `Analyze this hairstyle image and identify the specific braiding or natural hair style shown. 
    
Available styles:
- Box Braids
- Knotless Braids
- Senegalese Twists
- Faux Locs
- Cornrows
- Two-Strand Twists
- Passion Twists
- Goddess Locs

Please respond in JSON format with:
{
  "detectedStyle": "exact name from list above or 'Unknown'",
  "confidence": "high/medium/low",
  "description": "brief description of what you see",
  "alternativeStyles": ["list", "of", "similar", "styles"]
}`;

    console.log('📤 Sending request to OpenAI GPT-4 Vision...');
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
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    console.log('📥 Received response from OpenAI');
    const text = response.choices[0].message.content || '';
    console.log('📝 Response text:', text.substring(0, 200));
    
    // Try to parse JSON from response
    let analysisData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      analysisData = JSON.parse(jsonText);
      console.log('✅ Successfully parsed analysis data');
    } catch (parseError) {
      console.warn('⚠️ Failed to parse OpenAI response as JSON, using fallback');
      // Fallback: try to extract style name from text
      const styleMatch = text.match(/(?:detected|identified|shows?|appears?|looks? like)\s+(?:a\s+)?([^.\n]+)/i);
      analysisData = {
        detectedStyle: styleMatch ? styleMatch[1].trim() : 'Unknown',
        confidence: 'low',
        description: text.substring(0, 200),
        alternativeStyles: []
      };
    }

    console.log('✅ Returning successful analysis');
    return NextResponse.json({
      success: true,
      analysis: analysisData
    });

  } catch (error: any) {
    console.error('❌ Error analyzing style image:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to analyze image';
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500),
      response: error.response?.data
    };
    
    console.error('❌ Full error details:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : 'An error occurred while analyzing the image.'
      },
      { status: 500 }
    );
  }
}

