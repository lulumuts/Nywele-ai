import { NextRequest, NextResponse } from 'next/server';
import { analyzeHairImage, detectHairType, detectHairstyle, analyzeHairHealth } from '@/lib/vision';

export async function POST(request: NextRequest) {
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

    // Check if Vision API is configured
    if (!process.env.GOOGLE_CLOUD_VISION_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return NextResponse.json({
        success: false,
        error: 'Vision API not configured',
        message: 'Set GOOGLE_CLOUD_VISION_API_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable'
      }, { status: 503 });
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

