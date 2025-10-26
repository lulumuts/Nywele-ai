import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: 'Gemini API not configured' },
        { status: 500 }
      );
    }

    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Use Gemini Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Remove data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    let analysisData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      analysisData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', text);
      // Fallback: try to extract style name from text
      const styleMatch = text.match(/(?:detected|identified|shows?|appears?|looks? like)\s+(?:a\s+)?([^.\n]+)/i);
      analysisData = {
        detectedStyle: styleMatch ? styleMatch[1].trim() : 'Unknown',
        confidence: 'low',
        description: text.substring(0, 200),
        alternativeStyles: []
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData
    });

  } catch (error: any) {
    console.error('Error analyzing style image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}

