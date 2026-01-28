// Google Cloud Vision API client
import { ImageAnnotatorClient } from '@google-cloud/vision';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Vision API client - LAZY initialization instead of module-level
// This ensures environment variables are loaded when the function is called
let visionClient: ImageAnnotatorClient | null = null;
let useApiKey = false;
let apiKey: string | null = null;
let initializationAttempted = false;

/**
 * Initialize Vision API client on first use (lazy initialization)
 * This ensures environment variables are available when called
 */
function initializeVisionClient() {
  if (initializationAttempted) {
    return; // Already tried, don't retry
  }
  initializationAttempted = true;

  try {
    // First, try service account credentials (for production)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      const resolvedPath = path.isAbsolute(credentialsPath) 
        ? credentialsPath 
        : path.resolve(process.cwd(), credentialsPath);
      
      console.log('🔍 Checking credentials at:', resolvedPath);
      console.log('🔍 Current working directory:', process.cwd());
      console.log('🔍 File exists:', fs.existsSync(resolvedPath));
      
      if (fs.existsSync(resolvedPath)) {
        try {
          // Load and validate credentials file
          const credentialsContent = fs.readFileSync(resolvedPath, 'utf8');
          const credentials = JSON.parse(credentialsContent);
          
          if (credentials.type === 'service_account' && credentials.project_id) {
            // Use keyFilename option - this is the recommended way
            visionClient = new ImageAnnotatorClient({
              keyFilename: resolvedPath,
            });
            console.log('✅ Vision API initialized with service account credentials');
            console.log('✅ Project ID:', credentials.project_id);
            return;
          } else {
            console.log('⚠️ Invalid credentials file format - missing type or project_id');
          }
        } catch (parseError: any) {
          console.log('⚠️ Failed to parse credentials file:', parseError.message);
        }
      } else {
        console.log('⚠️ GOOGLE_APPLICATION_CREDENTIALS file not found:', resolvedPath);
      }
    }
    
    // If no service account, try API key (for development)
    if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
      apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
      useApiKey = true;
      console.log('✅ Vision API will use REST API with API key');
    } else {
      console.log('⚠️ Neither GOOGLE_APPLICATION_CREDENTIALS nor GOOGLE_CLOUD_VISION_API_KEY found');
    }
  } catch (error: any) {
    console.error('⚠️ Failed to initialize Vision API client:', error.message || error);
    // Check if we can fall back to API key
    if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
      apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
      useApiKey = true;
      console.log('✅ Falling back to REST API with API key');
    }
  }
}

export { visionClient };

/**
 * Analyze hair image using Vision API via REST (for API key authentication)
 */
async function analyzeImageWithApiKey(imageBase64: string) {
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        image: { content: base64Data },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'FACE_DETECTION', maxResults: 1 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Vision API error: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage += ` - ${errorData.error?.message || errorText}`;
    } catch {
      errorMessage += ` - ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const result = data.responses[0];

  // Handle potential errors in response
  if (result.error) {
    throw new Error(`Vision API error: ${result.error.message || 'Unknown error'}`);
  }

  return {
    labels: result.labelAnnotations || [],
    colors: result.imagePropertiesAnnotation?.dominantColors?.colors || [],
    faces: result.faceAnnotations || [],
    objects: result.localizedObjectAnnotations || [],
    fullResponse: result,
  };
}

/**
 * Analyze hair image using Vision API
 * Returns labels, colors, and other detected features
 */
export async function analyzeHairImage(imageBase64: string) {
  // Initialize on first use, not at module load
  // This ensures environment variables are available
  initializeVisionClient();

  if (!visionClient && !useApiKey) {
    throw new Error('Vision API not configured. Set GOOGLE_CLOUD_VISION_API_KEY or GOOGLE_APPLICATION_CREDENTIALS');
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Use client library if available (service account), otherwise use REST API (API key)
    if (visionClient) {
      const [result] = await visionClient.annotateImage({
        image: { content: base64Data },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'FACE_DETECTION', maxResults: 1 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
        ],
      });

      return {
        labels: result.labelAnnotations || [],
        colors: result.imagePropertiesAnnotation?.dominantColors?.colors || [],
        faces: result.faceAnnotations || [],
        objects: result.localizedObjectAnnotations || [],
        fullResponse: result,
      };
    } else {
      // Use REST API with API key
      return await analyzeImageWithApiKey(imageBase64);
    }
  } catch (error: any) {
    console.error('Vision API error:', error);
    
    // Provide more helpful error messages
    if (error.code === 7) {
      throw new Error('Vision API: Permission denied. Check that the service account has "Cloud Vision API User" role.');
    } else if (error.code === 8) {
      throw new Error('Vision API: Resource exhausted. Check API quotas and billing.');
    } else if (error.message?.includes('API key')) {
      throw new Error('Vision API: Invalid API key. Check your GOOGLE_CLOUD_VISION_API_KEY.');
    }
    
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

/**
 * Extract hair characteristics from labels with better pattern matching
 * Specifically optimized for Afro hair (Type 4) textures
 */
export function extractHairCharacteristics(labels: any[], detectedHairType?: { hairType: string; confidence: number } | null): {
  texture: string | null;
  length: string | null;
  density: string | null;
  porosity: string | null;
  curlPattern: string | null;
} {
  const allText = labels.map(l => (l.description || '').toLowerCase()).join(' ');
  const characteristics: any = {};

  // If we have detected hair type (4a/4b/4c), use it to determine texture
  if (detectedHairType?.hairType) {
    const type = detectedHairType.hairType.toLowerCase();
    if (type.startsWith('4')) {
      characteristics.texture = 'coily';
      characteristics.curlPattern = type;
    } else if (type.startsWith('3')) {
      characteristics.texture = 'curly';
    } else if (type.startsWith('2')) {
      characteristics.texture = 'wavy';
    } else if (type.startsWith('1')) {
      characteristics.texture = 'straight';
    }
  }

  // Texture detection from labels - optimized for Afro hair patterns
  // Only use this if we don't already have texture from hair type
  if (!characteristics.texture) {
    // Check for coily/Type 4 patterns first (more specific)
    if (/tight curl|coily|kinky|zigzag|z-pattern|spring|coil|afro texture|type 4|4c|4b|4a|afro/.test(allText)) {
      characteristics.texture = 'coily';
    } else if (/curl|curly|ringlet|s-pattern|spiral|type 3/.test(allText)) {
      characteristics.texture = 'curly';
    } else if (/wavy|wave|slight curl|type 2/.test(allText)) {
      characteristics.texture = 'wavy';
    } else if (/straight|flat|type 1/.test(allText)) {
      characteristics.texture = 'straight';
    }
  }

  // Length detection
  if (/short|twa|teeny weeny afro|pixie|buzz|cropped|chin length|ear length/.test(allText)) {
    characteristics.length = 'short';
  } else if (/shoulder|medium|bob|mid-length|neck length/.test(allText)) {
    characteristics.length = 'medium';
  } else if (/long|waist|hip|bra strap|lengthy|shoulder blade/.test(allText)) {
    characteristics.length = 'long';
  }

  // Density detection - important for Afro hair
  if (/thick|dense|voluminous|full|abundant|heavy|high density/.test(allText)) {
    characteristics.density = 'thick';
  } else if (/thin|sparse|fine|light|delicate|low density|thinning/.test(allText)) {
    characteristics.density = 'thin';
  } else {
    characteristics.density = 'medium';
  }

  // Porosity hints from condition indicators
  if (/dry|dehydrated|porous|high porosity|absorbs quickly/.test(allText)) {
    characteristics.porosity = 'high';
  } else if (/moisturized|hydrated|sealed|low porosity|resistant|shiny/.test(allText)) {
    characteristics.porosity = 'low';
  } else {
    characteristics.porosity = 'medium';
  }

  // Curl pattern refinement - Type 4 (Afro) specific
  if (/4c|tight curl|zigzag|spring|dense curl|type 4c/.test(allText)) {
    characteristics.curlPattern = '4c';
  } else if (/4b|z-pattern|coily|type 4b/.test(allText)) {
    characteristics.curlPattern = '4b';
  } else if (/4a|s-pattern|coil|defined curl|type 4a/.test(allText)) {
    characteristics.curlPattern = '4a';
  } else if (/type 4|afro|kinky|coily/.test(allText)) {
    // Default to 4c if we know it's type 4 but can't determine subtype
    characteristics.curlPattern = '4c';
  }

  return {
    texture: characteristics.texture || null,
    length: characteristics.length || null,
    density: characteristics.density || null,
    porosity: characteristics.porosity || null,
    curlPattern: characteristics.curlPattern || null,
  };
}

/**
 * Detect hair length from labels
 */
export function detectHairLength(labels: any[]): { length: string; confidence: number } | null {
  const lengthKeywords = {
    'short': ['short hair', 'buzz cut', 'pixie', 'twa', 'teeny weeny afro', 'cropped'],
    'medium': ['shoulder length', 'medium length', 'bob', 'chin length'],
    'long': ['long hair', 'waist length', 'hip length', 'shoulder blade', 'bra strap'],
  };

  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');

  for (const [length, keywords] of Object.entries(lengthKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      const matchingLabel = labels.find(l => 
        keywords.some(k => (l.description || '').toLowerCase().includes(k))
      );
      return {
        length,
        confidence: matchingLabel?.score || 0.7,
      };
    }
  }

  return null;
}

/**
 * Assess hair density from labels
 */
export function assessHairDensity(labels: any[]): { density: string; confidence: number } | null {
  const densityKeywords = {
    'thick': ['thick hair', 'dense', 'voluminous', 'full', 'abundant'],
    'medium': ['medium density', 'normal thickness'],
    'thin': ['thin hair', 'sparse', 'fine hair', 'thinning'],
  };

  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');

  for (const [density, keywords] of Object.entries(densityKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      const matchingLabel = labels.find(l => 
        keywords.some(k => (l.description || '').toLowerCase().includes(k))
      );
      return {
        density,
        confidence: matchingLabel?.score || 0.7,
      };
    }
  }

  return null;
}

/**
 * Detect damage indicators
 */
export function detectDamage(labels: any[]): {
  damageTypes: string[];
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  indicators: string[];
} {
  const damageKeywords = {
    'split ends': ['split end', 'split', 'damaged end'],
    'breakage': ['breakage', 'broken', 'fracture'],
    'dryness': ['dry', 'dehydrated', 'parched'],
    'frizz': ['frizzy', 'frizz', 'unruly'],
    'brittleness': ['brittle', 'fragile'],
    'thinning': ['thinning', 'bald patch', 'receding'],
    'color damage': ['bleached', 'over-processed', 'color treated'],
  };

  const damageTypes: string[] = [];
  const indicators: string[] = [];
  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');

  for (const [damageType, keywords] of Object.entries(damageKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      damageTypes.push(damageType);
      const matchingLabels = labels.filter(l => 
        keywords.some(k => (l.description || '').toLowerCase().includes(k))
      );
      indicators.push(...matchingLabels.map(l => l.description || ''));
    }
  }

  let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
  if (damageTypes.length >= 4) severity = 'severe';
  else if (damageTypes.length >= 2) severity = 'moderate';
  else if (damageTypes.length >= 1) severity = 'mild';

  return { damageTypes, severity, indicators };
}

/**
 * Assess shine/gloss level
 */
export function assessShine(labels: any[]): { level: string; confidence: number } | null {
  const shineKeywords = {
    'high': ['shiny', 'glossy', 'lustrous', 'gleaming', 'reflective'],
    'medium': ['slight shine', 'natural shine'],
    'low': ['dull', 'matte', 'lackluster', 'no shine'],
  };

  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');

  for (const [level, keywords] of Object.entries(shineKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      const matchingLabel = labels.find(l => 
        keywords.some(k => (l.description || '').toLowerCase().includes(k))
      );
      return {
        level,
        confidence: matchingLabel?.score || 0.7,
      };
    }
  }

  return null;
}

/**
 * Assess frizz level
 */
export function assessFrizz(labels: any[]): { level: string; confidence: number } | null {
  const frizzKeywords = {
    'high': ['frizzy', 'frizz', 'unruly', 'unmanageable', 'wild'],
    'medium': ['slight frizz', 'some frizz'],
    'low': ['smooth', 'tamed', 'controlled', 'defined'],
  };

  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');

  for (const [level, keywords] of Object.entries(frizzKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      const matchingLabel = labels.find(l => 
        keywords.some(k => (l.description || '').toLowerCase().includes(k))
      );
      return {
        level,
        confidence: matchingLabel?.score || 0.7,
      };
    }
  }

  return null;
}

/**
 * Detect volume/body
 */
export function assessVolume(labels: any[]): { volume: string; confidence: number } | null {
  const volumeKeywords = {
    'high': ['voluminous', 'full', 'thick', 'big', 'bouncy', 'body'],
    'medium': ['normal volume', 'average'],
    'low': ['flat', 'limp', 'lacking volume', 'thin'],
  };

  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');

  for (const [volume, keywords] of Object.entries(volumeKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      const matchingLabel = labels.find(l => 
        keywords.some(k => (l.description || '').toLowerCase().includes(k))
      );
      return {
        volume,
        confidence: matchingLabel?.score || 0.7,
      };
    }
  }

  return null;
}

/**
 * Detect color treatment
 */
export function detectColorTreatment(labels: any[], colors: any[]): {
  hasColorTreatment: boolean;
  treatmentType: string | null;
  confidence: number;
} {
  const treatmentKeywords = {
    'bleached': ['bleached', 'blonde', 'lightened', 'platinum'],
    'dyed': ['dyed', 'colored', 'hair dye', 'tinted'],
    'highlighted': ['highlight', 'streaks', 'foil'],
    'natural': ['natural color', 'virgin hair'],
  };

  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');
  let treatmentType: string | null = null;
  let confidence = 0;

  // Check labels
  for (const [treatment, keywords] of Object.entries(treatmentKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      const matchingLabel = labels.find(l => 
        keywords.some(k => (l.description || '').toLowerCase().includes(k))
      );
      if (matchingLabel && matchingLabel.score > confidence) {
        treatmentType = treatment;
        confidence = matchingLabel.score;
      }
    }
  }

  // Check for unusual colors (non-black/brown)
  if (!treatmentType && colors.length > 0) {
    const topColor = colors[0];
    if (topColor.color) {
      const { red, green, blue } = topColor.color;
      // Check if color is not in typical natural hair range (dark browns/blacks)
      if (red > 100 || green > 100 || blue > 100) {
        treatmentType = 'dyed';
        confidence = 0.6;
      }
    }
  }

  return {
    hasColorTreatment: treatmentType !== null && treatmentType !== 'natural',
    treatmentType,
    confidence,
  };
}

/**
 * Detect product residues (oils, gels, styling products)
 */
export function detectProductResidues(labels: any[]): {
  products: string[];
  visible: boolean;
} {
  const productKeywords = {
    'oil': ['oil', 'greasy', 'oily', 'shine product'],
    'gel': ['gel', 'styling gel', 'hair gel'],
    'mousse': ['mousse', 'foam'],
    'spray': ['hairspray', 'spray'],
    'cream': ['cream', 'pomade', 'styling cream'],
  };

  const products: string[] = [];
  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');

  for (const [product, keywords] of Object.entries(productKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      products.push(product);
    }
  }

  return {
    products,
    visible: products.length > 0,
  };
}

/**
 * Assess scalp visibility/health indicators
 */
export function assessScalp(labels: any[]): {
  visible: boolean;
  health: string | null;
  concerns: string[];
} {
  const scalpKeywords = {
    'healthy': ['healthy scalp', 'clean scalp'],
    'dandruff': ['dandruff', 'flaky', 'scalp flakes'],
    'dry': ['dry scalp', 'itchy scalp'],
    'oily': ['oily scalp', 'greasy scalp'],
  };

  const labelText = labels.map(l => (l.description || '').toLowerCase()).join(' ');
  const concerns: string[] = [];
  let health: string | null = null;

  // Check if scalp is visible (thinning hair, parting visible)
  const visible = labelText.includes('scalp') || 
                  labelText.includes('parting') || 
                  labelText.includes('thinning');

  for (const [condition, keywords] of Object.entries(scalpKeywords)) {
    if (keywords.some(keyword => labelText.includes(keyword))) {
      if (condition !== 'healthy') {
        concerns.push(condition);
      }
      health = condition;
    }
  }

  return { visible, health, concerns };
}

/**
 * Comprehensive hair analysis combining all metrics
 */
export function comprehensiveHairAnalysis(analysis: {
  labels: any[];
  colors: any[];
  faces: any[];
  objects: any[];
}): {
  hairType: ReturnType<typeof detectHairType> | null;
  style: ReturnType<typeof detectHairstyle> | null;
  health: ReturnType<typeof analyzeHairHealth>;
  length: ReturnType<typeof detectHairLength> | null;
  density: ReturnType<typeof assessHairDensity> | null;
  damage: ReturnType<typeof detectDamage>;
  shine: ReturnType<typeof assessShine> | null;
  frizz: ReturnType<typeof assessFrizz> | null;
  volume: ReturnType<typeof assessVolume> | null;
  colorTreatment: ReturnType<typeof detectColorTreatment>;
  productResidues: ReturnType<typeof detectProductResidues>;
  scalp: ReturnType<typeof assessScalp>;
  overallQuality: number;
  extractedCharacteristics: ReturnType<typeof extractHairCharacteristics>;
} {
  const hairType = detectHairType(analysis.labels);
  const style = detectHairstyle(analysis.labels);
  const health = analyzeHairHealth(analysis.labels);
  const length = detectHairLength(analysis.labels);
  const density = assessHairDensity(analysis.labels);
  const damage = detectDamage(analysis.labels);
  const shine = assessShine(analysis.labels);
  const frizz = assessFrizz(analysis.labels);
  const volume = assessVolume(analysis.labels);
  const colorTreatment = detectColorTreatment(analysis.labels, analysis.colors);
  const productResidues = detectProductResidues(analysis.labels);
  const scalp = assessScalp(analysis.labels);
  const extractedCharacteristics = extractHairCharacteristics(analysis.labels, hairType);

  // Use extracted characteristics to enhance length/density if not detected
  const enhancedLength = length || (extractedCharacteristics.length ? {
    length: extractedCharacteristics.length,
    confidence: 0.7
  } : null);
  
  const enhancedDensity = density || (extractedCharacteristics.density ? {
    density: extractedCharacteristics.density,
    confidence: 0.7
  } : null);

  // Calculate overall quality score (0-100)
  let qualityScore = health.healthScore;
  
  // Adjust based on damage
  if (damage.severity === 'severe') qualityScore -= 20;
  else if (damage.severity === 'moderate') qualityScore -= 10;
  else if (damage.severity === 'mild') qualityScore -= 5;

  // Adjust based on shine
  if (shine?.level === 'high') qualityScore += 10;
  else if (shine?.level === 'low') qualityScore -= 10;

  // Adjust based on frizz
  if (frizz?.level === 'high') qualityScore -= 10;
  else if (frizz?.level === 'low') qualityScore += 5;

  // Adjust based on color treatment
  if (colorTreatment.hasColorTreatment && colorTreatment.treatmentType === 'bleached') {
    qualityScore -= 5; // Bleached hair often needs more care
  }

  const overallQuality = Math.max(0, Math.min(100, qualityScore));

  return {
    hairType,
    style,
    health,
    length: enhancedLength,
    density: enhancedDensity,
    damage,
    shine,
    frizz,
    volume,
    colorTreatment,
    productResidues,
    scalp,
    overallQuality,
    extractedCharacteristics,
  };
}

export default visionClient;
