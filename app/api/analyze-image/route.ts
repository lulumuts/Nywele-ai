import { NextRequest, NextResponse } from 'next/server';
import { analyzeHairImage, detectHairType, detectHairstyle, analyzeHairHealth, visionClient } from '@/lib/vision';
import { requireAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  // Check authentication (allows internal requests OR valid API key)
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

    // Check if Vision API client is initialized
    if (!visionClient) {
      console.log('⚠️ Vision API not configured, returning default analysis');
      
      // Return basic default analysis when Vision API is not configured
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
          note: 'Vision API not configured - using defaults'
        }
      });
    }

    console.log(`🔍 Analyzing ${imageType || 'unknown'} image with Vision API...`);

    // Analyze image with Vision API
    const analysis = await analyzeHairImage(image);

    // Extract hair-specific insights
    const hairTypeDetection = detectHairType(analysis.labels);
    const hairstyleDetection = detectHairstyle(analysis.labels);
    const hairHealth = analyzeHairHealth(analysis.labels);

    // Get top labels (most confident)
    const topLabels = analysis.labels
      .slice(0, 10)
      .map((label: any) => ({
        name: label.description,
        confidence: Math.round((label.score || 0) * 100),
      }));

    // Extract dominant colors
    const dominantColors = analysis.colors
      .slice(0, 5)
      .map((color: any) => ({
        color: color.color,
        score: color.score,
        pixelFraction: color.pixelFraction,
      }));

    console.log('✅ Analysis complete');
    console.log('  Hair Type:', hairTypeDetection?.hairType || 'unknown');
    console.log('  Style:', hairstyleDetection?.style || 'unknown');
    console.log('  Health Score:', hairHealth.healthScore);

    return NextResponse.json({
      success: true,
      data: {
        // Hair-specific analysis
        hairType: hairTypeDetection,
        detectedStyle: hairstyleDetection,
        health: hairHealth,
        
        // Raw Vision API data
        labels: topLabels,
        colors: dominantColors,
        hasFace: analysis.faces.length > 0,
        
        // Metadata
        imageType: imageType || 'unknown',
        analyzedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Image analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze image',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

