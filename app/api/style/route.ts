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

    // Build detailed prompt for hairstyle image generation
    const prompt = `Create a high-quality, professional photograph of a beautiful Black woman with ${hairType} hair texture wearing a ${styleName} hairstyle. 

REQUIREMENTS:
- Natural, authentic African hair texture (type ${hairType})
- ${styleName} hairstyle beautifully executed
- Professional salon-quality styling
- Warm, natural lighting
- Close-up or medium shot focusing on the hairstyle
- Confident, joyful expression
- ${skinTone ? `${skinTone} skin tone` : 'Rich, natural skin tone'}
- High resolution, magazine-quality photography
- Celebrate natural African beauty

STYLE: Professional beauty photography, vibrant colors, sharp focus on hair details, aspirational yet authentic.`;

    // Generate image with Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const imageData = response.text();

    // Note: Gemini 1.5 Flash generates text descriptions by default
    // For actual image generation, you'd need Imagen API
    // For now, we'll return the description and use a placeholder
    
    // Fallback: Use a curated stock image based on hair type and style
    const imageUrl = getStockImageUrl(hairType, styleName);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        description: imageData,
        hairType,
        styleName
      }
    });

  } catch (error) {
    console.error('Style generation error:', error);
    
    // Fallback to stock image on error
    const { hairType, styleName } = await request.json();
    const fallbackUrl = getStockImageUrl(hairType, styleName);
    
    return NextResponse.json({
      success: true,
      data: {
        imageUrl: fallbackUrl,
        description: `Beautiful ${styleName} style for ${hairType} hair`,
        hairType,
        styleName,
        fallback: true
      }
    });
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