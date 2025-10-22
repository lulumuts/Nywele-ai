// Google Cloud Vision API client
import vision from '@google-cloud/vision';

// Initialize Vision API client
// In production, use service account credentials
// For development, we'll use API key authentication
let visionClient: vision.ImageAnnotatorClient | null = null;

if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
  // Using API key (simpler for development)
  visionClient = new vision.ImageAnnotatorClient({
    apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
  });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Using service account JSON (for production)
  visionClient = new vision.ImageAnnotatorClient();
}

export { visionClient };

/**
 * Analyze hair image using Vision API
 * Returns labels, colors, and other detected features
 */
export async function analyzeHairImage(imageBase64: string) {
  if (!visionClient) {
    throw new Error('Vision API not configured. Set GOOGLE_CLOUD_VISION_API_KEY or GOOGLE_APPLICATION_CREDENTIALS');
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Call Vision API with multiple feature types
    const [result] = await visionClient.annotateImage({
      image: { content: base64Data },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'FACE_DETECTION', maxResults: 1 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
      ],
    });

    return {
      labels: result.labelAnnotations || [],
      colors: result.imagePropertiesAnnotation?.dominantColors?.colors || [],
      faces: result.faceAnnotations || [],
      objects: result.localizedObjectAnnotations || [],
      fullResponse: result,
    };
  } catch (error) {
    console.error('Vision API error:', error);
    throw error;
  }
}

/**
 * Detect hair type from image labels
 */
export function detectHairType(labels: any[]): { hairType: string; confidence: number } | null {
  const hairTypeKeywords = {
    '4c': ['afro', 'coily', 'kinky', 'tight curl', 'dense', 'zigzag'],
    '4b': ['coily', 'kinky', 'z-pattern', 'dense curl'],
    '4a': ['coily', 'curl', 's-pattern', 'defined curl'],
  };

  for (const [type, keywords] of Object.entries(hairTypeKeywords)) {
    for (const label of labels) {
      const description = label.description?.toLowerCase() || '';
      if (keywords.some(keyword => description.includes(keyword))) {
        return {
          hairType: type,
          confidence: label.score || 0,
        };
      }
    }
  }

  return null;
}

/**
 * Detect hairstyle from image labels
 */
export function detectHairstyle(labels: any[]): { style: string; confidence: number } | null {
  const styleKeywords = {
    'box-braids': ['braid', 'box braid', 'braided', 'plait'],
    'knotless-braids': ['braid', 'knotless', 'braided'],
    'cornrows': ['cornrow', 'corn row', 'rows', 'scalp braid'],
    'locs': ['loc', 'dreadlock', 'dreads', 'locks'],
    'twists': ['twist', 'two strand', 'rope twist'],
    'afro': ['afro', 'natural', 'picked out'],
    'puff': ['puff', 'high puff', 'ponytail'],
  };

  for (const [style, keywords] of Object.entries(styleKeywords)) {
    for (const label of labels) {
      const description = label.description?.toLowerCase() || '';
      if (keywords.some(keyword => description.includes(keyword))) {
        return {
          style,
          confidence: label.score || 0,
        };
      }
    }
  }

  return null;
}

/**
 * Extract hair health indicators from labels
 */
export function analyzeHairHealth(labels: any[]): {
  healthScore: number;
  indicators: string[];
} {
  const positiveIndicators = ['shiny', 'healthy', 'vibrant', 'glossy', 'smooth', 'well-groomed'];
  const negativeIndicators = ['dry', 'damaged', 'brittle', 'frizzy', 'dull'];

  const positive: string[] = [];
  const negative: string[] = [];

  for (const label of labels) {
    const description = label.description?.toLowerCase() || '';
    
    if (positiveIndicators.some(ind => description.includes(ind))) {
      positive.push(description);
    }
    if (negativeIndicators.some(ind => description.includes(ind))) {
      negative.push(description);
    }
  }

  // Calculate health score (0-100)
  const healthScore = Math.max(0, Math.min(100, 
    50 + (positive.length * 15) - (negative.length * 15)
  ));

  return {
    healthScore,
    indicators: [...positive, ...negative],
  };
}

export default visionClient;

