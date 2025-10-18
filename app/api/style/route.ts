import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateImagePrompt } from '@/lib/promptGenerator';
import { trackStyleGeneration } from '@/lib/analytics';

// Initialize Google GenAI client for Gemini Native Image Generation (Nano Banana)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hairType, styleName, ethnicity, length, vibe } = body;

    // Validation
    if (!hairType || !styleName) {
      return NextResponse.json(
        { error: 'Hair type and style name are required' },
        { status: 400 }
      );
    }

    // Generate the detailed, bias-countering prompt
    const detailedPrompt = generateImagePrompt({
      ethnicity: ethnicity || 'Black Woman',
      hairType,
      desiredStyle: styleName,
      length: length || 'Shoulder-Length',
      vibe: vibe || 'Professional Studio Portrait'
    });

    console.log('🎨 Generated Gemini Prompt:', detailedPrompt);

    // Try to use Gemini Native Image Generation (Nano Banana)
    if (genAI) {
      try {
        console.log('🚀 Calling Gemini 2.5 Flash Image (Nano Banana) API...');
        
        // Use Gemini's native image generation model with explicit configuration
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash-image',
          generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 0.4, // Lower temperature for more faithful prompt following
          } as any, // Type assertion for Gemini image generation config
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT', 
              threshold: 'BLOCK_NONE'
            }
          ] as any
        });
        
        const result = await model.generateContent([detailedPrompt]);

        console.log('✅ Gemini API responded');
        
        // Extract the response
        const response = await result.response;
        const candidates = response.candidates;
        
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content.parts;
          
          // Look for inline image data
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              console.log('📸 Image generated successfully via Gemini Nano Banana!');
              
              // Convert base64 to data URL
              const mimeType = part.inlineData.mimeType || 'image/png';
              const base64Data = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64Data}`;
              
              // Track successful AI generation
              trackStyleGeneration({
                hairType,
                style: styleName,
                ethnicity,
                length,
                vibe,
                success: true,
              }).catch(err => console.error('Analytics tracking failed:', err));

              return NextResponse.json({
                success: true,
                data: {
                  imageUrl: dataUrl,
                  description: detailedPrompt,
                  hairType,
                  styleName,
                  ethnicity,
                  length,
                  vibe,
                  prompt: detailedPrompt,
                  generatedBy: 'gemini-nano-banana',
                  aiGenerated: true
                }
              });
            }
          }
        }
        
        console.log('⚠️ No image data in Gemini response, using fallback');
        console.log('Response structure:', JSON.stringify(response, null, 2));
      } catch (geminiError: any) {
        console.error('❌ Gemini image generation failed:', geminiError);
        console.error('Error details:', geminiError.message);
        console.error('Error stack:', geminiError.stack);
        console.log('Falling back to curated images');
      }
    }

    // Fallback to curated stock images
    const imageUrl = getStockImageUrl(hairType, styleName);

    // Track fallback usage
    trackStyleGeneration({
      hairType,
      style: styleName,
      ethnicity,
      length,
      vibe,
      success: false, // Using fallback, not AI-generated
    }).catch(err => console.error('Analytics tracking failed:', err));

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        description: detailedPrompt,
        hairType,
        styleName,
        ethnicity,
        length,
        vibe,
        prompt: detailedPrompt,
        generatedBy: 'curated-stock',
        fallback: true
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
  // Expanded map of curated Unsplash/Pexels images for African hairstyles
  const imageMap: Record<string, string> = {
    'box braids': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80',
    'cornrows': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80',
    'twists': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80',
    'twist out': 'https://images.unsplash.com/photo-1616683693457-c45984ccb3ae?w=800&q=80',
    'bantu knots': 'https://images.unsplash.com/photo-1583884098485-8e9a6ee00eb3?w=800&q=80',
    'afro/natural': 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=800&q=80',
    'afro': 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=800&q=80',
    'natural': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'locs/dreadlocs': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    'locs': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    'dreadlocs': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    'senegalese twists': 'https://images.unsplash.com/photo-1598217309180-a9ea0cb11175?w=800&q=80',
    'crochet braids': 'https://images.unsplash.com/photo-1580465039100-ec840a36bb4c?w=800&q=80',
    'braided updo': 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&q=80',
    'faux locs': 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&q=80',
    'wash and go': 'https://images.unsplash.com/photo-1616683693457-c45984ccb3ae?w=800&q=80',
    'flat twists': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80',
    'protective style': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80',
    'braids': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80',
  };

  // Normalize and try exact match first
  const styleLower = styleName.toLowerCase().trim();
  
  // Direct lookup
  if (imageMap[styleLower]) {
    return imageMap[styleLower];
  }

  // Try partial match (more flexible)
  for (const [key, url] of Object.entries(imageMap)) {
    const keyLower = key.toLowerCase();
    // Check if style contains key or key contains style
    if (styleLower.includes(keyLower) || keyLower.includes(styleLower)) {
      console.log(`Matched style "${styleName}" to key "${key}"`);
      return url;
    }
    // Also check for individual words (e.g., "bantu" in "Bantu Knots")
    const styleWords = styleLower.split(' ');
    const keyWords = keyLower.split(' ');
    if (styleWords.some(word => keyWords.includes(word)) || keyWords.some(word => styleWords.includes(word))) {
      console.log(`Matched style "${styleName}" to key "${key}" via word match`);
      return url;
    }
  }

  // Default based on hair type for Type 4 hair (most common for African hair)
  if (hairType === '4c' || hairType === '4b' || hairType === '4a') {
    return 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=800&q=80';
  }
  
  // Default for Type 3 hair
  if (hairType === '3c' || hairType === '3b' || hairType === '3a') {
    return 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80';
  }
  
  // General fallback
  return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
}