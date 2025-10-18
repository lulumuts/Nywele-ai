import { NextRequest, NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hairType, styleName, skinTone } = body;

    if (!hairType || !styleName) {
      return NextResponse.json(
        { error: 'Hair type and style name are required' },
        { status: 400 }
      );
    }

    // Use Gemini to generate enhanced description (optional, with fallback)
    let aiDescription = `Beautiful ${styleName} style for ${hairType} hair`;
    
    try {
      if (geminiModel) {
        const prompt = `In one concise sentence, describe a ${styleName} hairstyle on ${hairType} African hair, focusing on texture, styling technique, and aesthetic appeal.`;
        
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        aiDescription = response.text() || aiDescription;
      }
    } catch (geminiError) {
      // Gemini failed, continue with fallback description
      console.log('Gemini description generation failed, using fallback');
    }

    // Always return curated stock image (reliable and fast)
    const imageUrl = getStockImageUrl(hairType, styleName);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        description: aiDescription,
        hairType,
        styleName,
        generatedBy: 'gemini'
      }
    });

  } catch (error) {
    console.error('Style API error:', error);
    
    // Return error with safe fallback
    return NextResponse.json({
      success: false,
      error: 'Failed to generate style inspiration',
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        description: 'African hair style inspiration',
        fallback: true
      }
    }, { status: 500 });
  }
}

// Helper function to get appropriate stock images
function getStockImageUrl(hairType: string, styleName: string): string {
  // Map of curated Unsplash images for different hair types and styles
  const imageMap: Record<string, string> = {
    'box braids': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80',
    'cornrows': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80',
    'twists': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80',
    'afro': 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=800&q=80',
    'natural': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'locs': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    'braids': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80',
    'twist out': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80',
  };

  // Try to match style name
  const styleLower = styleName.toLowerCase();
  for (const [key, url] of Object.entries(imageMap)) {
    if (styleLower.includes(key)) {
      return url;
    }
  }

  // Default based on hair type
  if (hairType === '4c' || hairType === '4b') {
    return 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=800&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
}