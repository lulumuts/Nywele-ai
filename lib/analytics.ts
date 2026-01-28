import { supabase } from './supabase';

// Type for analytics events from Supabase
interface AnalyticsEvent {
  id: string;
  event_type: string;
  hair_type?: string;
  porosity?: string;
  concerns?: string[];
  style?: string;
  success?: boolean;
  product_name?: string;
  salon_name?: string;
  metadata?: any;
  created_at: string;
}

// Helper function to safely track recommendation events
export async function trackRecommendation(data: {
  hairType: string;
  goals: string[];
  currentStyle?: string;
  ethnicity: string;
  length: string;
  porosity?: string;
  concerns?: string[];
  desiredStyle?: string;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'recommendation',
        hair_type: data.hairType,
        porosity: data.porosity,
        concerns: data.concerns,
        style: data.desiredStyle,
        metadata: {
          goals: data.goals,
          currentStyle: data.currentStyle,
          ethnicity: data.ethnicity,
          length: data.length,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track recommendation:', error);
    } else {
      console.log('[Analytics] ✅ Tracked recommendation');
    }
  } catch (error) {
    console.error('[Analytics] Failed to track recommendation:', error);
  }
}

// Helper function to safely track style generation events
export async function trackStyleGeneration(data: {
  hairType: string;
  style: string;
  ethnicity: string;
  length: string;
  vibe: string;
  success: boolean;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'style_generation',
        hair_type: data.hairType,
        style: data.style,
        success: data.success,
        metadata: {
          ethnicity: data.ethnicity,
          length: data.length,
          vibe: data.vibe,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track style generation:', error);
    } else {
      console.log(`[Analytics] ✅ Tracked style generation (${data.success ? 'AI' : 'fallback'})`);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track style generation:', error);
  }
}

// Track product clicks
export async function trackProductClick(data: {
  productName: string;
  brand?: string;
  hairType?: string;
  price?: number;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'product_click',
        product_name: data.productName,
        hair_type: data.hairType,
        metadata: {
          brand: data.brand,
          price: data.price,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track product click:', error);
    } else {
      console.log('[Analytics] ✅ Tracked product click:', data.productName);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track product click:', error);
  }
}

// Track external booking link clicks (Fresha, Braiding Nairobi, etc.)
export async function trackExternalBookingLinkClick(data: {
  platform: string; // 'fresha' | 'braiding-nairobi' | 'other'
  style?: string;
  hairType?: string;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'external_booking_link_clicked',
        hair_type: data.hairType,
        style: data.style,
        metadata: {
          platform: data.platform,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track external booking link click:', error);
    } else {
      console.log('[Analytics] ✅ Tracked external booking link click:', data.platform);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track external booking link click:', error);
  }
}

// Track hair passport exports
export async function trackPassportExport(data: {
  format: 'text' | 'json' | 'pdf';
  hairType?: string;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'passport_exported',
        hair_type: data.hairType,
        metadata: {
          format: data.format,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track passport export:', error);
    } else {
      console.log('[Analytics] ✅ Tracked passport export:', data.format);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track passport export:', error);
  }
}

// Track style assessment completion (renamed from booking_completed)
export async function trackStyleAssessmentCompleted(data: {
  style: string;
  compatibility: 'compatible' | 'risky' | 'unknown';
  hairType?: string;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'style_assessment_completed',
        hair_type: data.hairType,
        style: data.style,
        metadata: {
          compatibility: data.compatibility,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track style assessment:', error);
    } else {
      console.log('[Analytics] ✅ Tracked style assessment:', data.style);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track style assessment:', error);
  }
}

// Track product scans (for future product intelligence feature)
export async function trackProductScan(data: {
  productName?: string;
  brand?: string;
  barcode?: string;
  compatibility?: 'compatible' | 'incompatible' | 'unknown';
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'product_scanned',
        product_name: data.productName,
        metadata: {
          brand: data.brand,
          barcode: data.barcode,
          compatibility: data.compatibility,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track product scan:', error);
    } else {
      console.log('[Analytics] ✅ Tracked product scan:', data.productName || data.barcode);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track product scan:', error);
  }
}

// Track routine adaptations (when users adapt routines based on location/climate)
export async function trackRoutineAdapted(data: {
  originalClimate?: string;
  newClimate?: string;
  location?: string;
  hairType?: string;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'routine_adapted',
        hair_type: data.hairType,
        metadata: {
          originalClimate: data.originalClimate,
          newClimate: data.newClimate,
          location: data.location,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track routine adaptation:', error);
    } else {
      console.log('[Analytics] ✅ Tracked routine adaptation');
    }
  } catch (error) {
    console.error('[Analytics] Failed to track routine adaptation:', error);
  }
}

// Legacy: Keep trackSalonView for backward compatibility but mark as deprecated
/** @deprecated Use trackExternalBookingLinkClick instead */
export async function trackSalonView(data: {
  salonName: string;
  location?: string;
  services?: string[];
  hairType?: string;
}) {
  // Redirect to new function
  return trackExternalBookingLinkClick({
    platform: 'other',
    hairType: data.hairType,
  });
}

// Get analytics stats
export async function getAnalyticsStats() {
  if (!supabase) {
    return null;
  }

  try {
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Analytics] Failed to fetch stats:', error);
      return null;
    }

    const recommendations = events?.filter((e: AnalyticsEvent) => e.event_type === 'recommendation') || [];
    const styleGenerations = events?.filter((e: AnalyticsEvent) => e.event_type === 'style_generation') || [];
    const productClicks = events?.filter((e: AnalyticsEvent) => e.event_type === 'product_click') || [];
    const salonViews = events?.filter((e: AnalyticsEvent) => e.event_type === 'salon_view') || [];
    const successfulAI = styleGenerations.filter((e: AnalyticsEvent) => e.success === true);

    return {
      totalRecommendations: recommendations.length,
      totalStyleGenerations: styleGenerations.length,
      totalProductClicks: productClicks.length,
      totalSalonViews: salonViews.length,
      aiSuccessRate: styleGenerations.length > 0 
        ? Math.round((successfulAI.length / styleGenerations.length) * 100)
        : 0,
      recentActivity: events?.slice(0, 10) || [],
      popularHairTypes: getPopularItems(recommendations, 'hair_type'),
      popularStyles: getPopularItems(styleGenerations, 'style'),
      popularProducts: getPopularItems(productClicks, 'product_name'),
      popularSalons: getPopularItems(salonViews, 'salon_name'),
    };
  } catch (error) {
    console.error('[Analytics] Failed to fetch stats:', error);
    return null;
  }
}

// Helper to get popular items from events
function getPopularItems(events: any[], field: string) {
  const counts: Record<string, number> = {};
  
  events.forEach(event => {
    const value = event[field];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

