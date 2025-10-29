import { NextRequest, NextResponse } from 'next/server';
import { generateHairCareRoutine, type HairCareProfile } from '@/lib/hairCare';
import { recommendProductsForRoutine } from '@/lib/products';
import { requireAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.hairAnalysis) {
      return NextResponse.json(
        { error: 'Hair analysis is required' },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects if needed
    const profile: HairCareProfile = {
      hairAnalysis: body.hairAnalysis,
      currentStyle: body.currentStyle
        ? {
            name: body.currentStyle.name,
            installedDate: new Date(body.currentStyle.installedDate),
            maintenanceDue: new Date(body.currentStyle.maintenanceDue),
          }
        : undefined,
      goals: body.goals || [],
      concerns: body.concerns || [],
      lifestyle: body.lifestyle || {
        activity: 'moderate',
        climate: 'temperate',
        budget: { min: 1000, max: 5000 },
      },
      allergies: body.allergies || [],
    };

    // Generate routine (this will now fetch products from Supabase!)
    const recommendation = await generateHairCareRoutine(profile);

    // Log for analytics (in production, save to database)
    console.log('💇 Hair care routine generated:', {
      routineId: recommendation.routineId,
      confidence: recommendation.confidence,
      hairType: profile.hairAnalysis.type,
      goals: profile.goals,
      productCount: (recommendation.productRecommendations?.essential?.length || 0) + 
                    (recommendation.productRecommendations?.optional?.length || 0),
      productsSource: 'Supabase (with fallback to mock)',
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Hair care routine generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hair care routine' },
      { status: 500 }
    );
  }
}

