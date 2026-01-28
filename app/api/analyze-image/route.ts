import { NextRequest, NextResponse } from 'next/server';
import { analyzeHairImage, comprehensiveHairAnalysis } from '@/lib/vision';
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

    // Comprehensive hair analysis using all detection functions
    const comprehensive = comprehensiveHairAnalysis(analysis);

    // Get top labels (most confident)
    const topLabels = analysis.labels
      .slice(0, 15)
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

    console.log('✅ Comprehensive analysis complete');
    console.log('  Hair Type:', comprehensive.hairType?.hairType || 'unknown');
    console.log('  Style:', comprehensive.style?.style || 'unknown');
    console.log('  Health Score:', comprehensive.health.healthScore);
    console.log('  Overall Quality:', comprehensive.overallQuality);
    console.log('  Damage Severity:', comprehensive.damage.severity);
    console.log('  Length:', comprehensive.length?.length || 'unknown');
    console.log('  Density:', comprehensive.density?.density || 'unknown');
    console.log('  Extracted Texture:', comprehensive.extractedCharacteristics.texture || 'unknown');
    console.log('  Extracted Length:', comprehensive.extractedCharacteristics.length || 'unknown');
    console.log('  Extracted Density:', comprehensive.extractedCharacteristics.density || 'unknown');

    return NextResponse.json({
      success: true,
      data: {
        // Comprehensive hair analysis
        hairType: comprehensive.hairType,
        detectedStyle: comprehensive.style,
        health: comprehensive.health,
        length: comprehensive.length,
        density: comprehensive.density,
        damage: comprehensive.damage,
        shine: comprehensive.shine,
        frizz: comprehensive.frizz,
        volume: comprehensive.volume,
        colorTreatment: comprehensive.colorTreatment,
        productResidues: comprehensive.productResidues,
        scalp: comprehensive.scalp,
        overallQuality: comprehensive.overallQuality,
        extractedCharacteristics: comprehensive.extractedCharacteristics,
        
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

