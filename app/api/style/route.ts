import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateImagePrompt } from '@/lib/promptGenerator';
import { trackStyleGeneration } from '@/lib/analytics';
import { findStyleImage, getStyleCostEstimate, getStyleInfo } from '@/lib/imageLibrary';
import { requireAuth } from '@/lib/apiAuth';

// Initialize Google GenAI client for Gemini Native Image Generation (Nano Banana)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

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
    // Note: AI bias documented in AI_BIAS_DOCUMENTATION.md
    // Keeping enabled to demonstrate bias-countering techniques
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

    // Use curated image library for authentic representation
    const lengthCategory = 
      length === 'Close-Cropped' || length === 'Ear-Length' ? 'short' :
      length === 'Chin-Length' || length === 'Shoulder-Length' ? 'medium' : 'long';
    
    const styleImage = findStyleImage(
      styleName,
      hairType,
      lengthCategory,
      'back' // Prefer back view
    );

    const imageUrl = styleImage?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
    const costEstimate = getStyleCostEstimate(styleName);
    const styleInfo = getStyleInfo(styleName);

    // Track fallback usage
    trackStyleGeneration({
      hairType,
      style: styleName,
      ethnicity,
      length,
      vibe,
      success: false, // Using curated images, not AI-generated
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
        generatedBy: styleImage?.source || 'curated-library',
        fallback: true,
        costEstimate,
        styleInfo,
        imageAttribution: styleImage?.attribution
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
