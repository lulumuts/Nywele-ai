// Prompt Generator for Gemini Image Generation
// Generates detailed, bias-countering prompts for African hairstyle images

export interface PromptInputs {
  ethnicity: string;
  hairType: string;
  desiredStyle: string;
  length: string;
  vibe: string;
  goals?: string[];
}

// Protective styles that HIDE natural texture (don't include hair type)
const PROTECTIVE_STYLES = [
  'Box Braids',
  'Cornrows',
  'Twists',
  'Bantu Knots',
  'Locs/Dreadlocs',
  'Senegalese Twists',
  'Crochet Braids',
  'Braided Updo',
  'Faux Locs',
  'Flat Twists',
  'Protective Style'
];

// Natural styles that SHOW natural texture (include hair type)
const NATURAL_STYLES = [
  'Afro/Natural',
  'Twist Out',
  'Wash and Go',
  'Tapered Cut'
];

// Map ethnicity to detailed subject description with hairstyle focus
function mapEthnicityToPrompt(ethnicity: string): string {
  const map: Record<string, string> = {
    'Black Woman': 'back view of a Black woman with dark, glowing skin showcasing',
    'Black Man': 'back view of a Black man with dark skin showcasing',
    'Person of African Descent': 'back view of a person of African descent showcasing'
  };
  return map[ethnicity] || map['Black Woman'];
}

// Map hairstyle to detailed style description
function mapStyleToPrompt(style: string): string {
  const styleMap: Record<string, string> = {
    'Box Braids': 'box braids with neat, uniform sections, clean parts, and consistent braid size throughout',
    'Cornrows': 'cornrows with precise, symmetrical rows braided close to the scalp in clear parallel lines',
    'Twists': 'two-strand twists with defined, rope-like sections showing clear twist pattern',
    'Twist Out': 'twist-out hairstyle with defined, separated coils, natural volume and visible curl definition',
    'Bantu Knots': 'Bantu knots arranged in a neat, symmetrical pattern across the entire scalp with tight, compact coils',
    'Afro/Natural': 'full, rounded afro with even volume, defined texture, and natural halo shape',
    'Locs/Dreadlocs': 'well-maintained locs with clean cylindrical sections, natural shine, and uniform thickness',
    'Senegalese Twists': 'Senegalese twists with smooth, rope-like texture and consistent twist direction',
    'Crochet Braids': 'crochet braids with natural-looking fullness and seamless attachment',
    'Braided Updo': 'intricate braided updo with clean parts, elegant styling, and visible braid pattern',
    'Faux Locs': 'faux locs with authentic dreadlock texture, natural appearance, and realistic loc formation',
    'Wash and Go': 'wash-and-go style with defined curls, natural volume, and visible curl pattern',
    'Flat Twists': 'flat twists braided close to the scalp with neat, uniform sections in clean rows',
    'Protective Style': 'protective hairstyle with neat, healthy appearance and clear style definition',
    'Tapered Cut': 'tapered cut with an extremely sharp, clean hairline and gradual fade'
  };
  return styleMap[style] || 'natural African hairstyle';
}

// Map hair type to specific texture description (ONLY for natural styles)
function mapTextureToPrompt(hairType: string): string {
  const textureMap: Record<string, string> = {
    '4c': 'Type 4C coily hair with high-volume, tightly-packed defined coils',
    '4b': 'Type 4B kinky hair with dense Z-pattern coils and natural volume',
    '4a': 'Type 4A coily hair with defined S-curl coils and springy texture',
    '3c': 'Type 3C hair with tight corkscrew curls and defined spirals',
    '3b': 'Type 3B hair with loose corkscrew curls and bouncy ringlets',
    '3a': 'Type 3A hair with loose spiral curls and flowing waves',
    '2c': 'Type 2C hair with defined S-shaped waves and body',
    '2b': 'Type 2B hair with gentle waves and natural movement',
    '2a': 'Type 2A hair with subtle waves and smooth texture',
    '1c': 'Type 1C straight hair with body and slight volume',
    '1b': 'Type 1B straight hair with smooth, sleek texture',
    '1a': 'Type 1A straight hair with fine, silky texture'
  };
  return textureMap[hairType] || 'natural African hair texture';
}

// Check if style is protective (hides natural texture)
function isProtectiveStyle(style: string): boolean {
  return PROTECTIVE_STYLES.includes(style);
}

// Map length to descriptive length phrase
function mapLengthToPrompt(length: string): string {
  const lengthMap: Record<string, string> = {
    'Close-Cropped': 'close-cropped length that defines the head shape',
    'Ear-Length': 'ear-length hair with volume and body',
    'Chin-Length': 'chin-length hair with full volume',
    'Shoulder-Length': 'shoulder-length hair with natural flow',
    'Mid-Back': 'mid-back length with impressive volume',
    'Waist-Length': 'waist-length hair with stunning length'
  };
  return lengthMap[length] || 'shoulder-length hair with natural flow';
}

// Map vibe/setting to photography and lighting details
function mapVibeToPrompt(vibe: string): string {
  const vibeMap: Record<string, string> = {
    'Professional Studio Portrait': 'professional studio lighting, 85mm lens, shallow depth of field, high-resolution, clean neutral background',
    'Outdoor Golden Hour': 'outdoor natural lighting during golden hour, warm glowing tones, soft focus background, natural environment',
    'Urban Street Style': 'urban environment, natural daylight, street photography style, authentic city setting',
    'Natural Indoor Lighting': 'soft indoor natural window light, warm tones, intimate comfortable setting',
    'Magazine Editorial': 'high-fashion editorial lighting, dramatic contrast, professional styling, editorial quality'
  };
  return vibeMap[vibe] || 'natural lighting with clean background';
}

/**
 * Generate a detailed, bias-countering prompt for Gemini image generation
 * 
 * @param inputs - User form inputs including ethnicity, hair type, style, length, and vibe
 * @returns Comprehensive prompt string optimized for authentic African hairstyle images
 */
export function generateImagePrompt(inputs: PromptInputs): string {
  const subject = mapEthnicityToPrompt(inputs.ethnicity);
  const style = mapStyleToPrompt(inputs.desiredStyle);
  const length = mapLengthToPrompt(inputs.length);
  const setting = mapVibeToPrompt(inputs.vibe);
  
  // Only include natural hair texture for styles that show it
  const isProtective = isProtectiveStyle(inputs.desiredStyle);
  
  let prompt: string;
  
  if (isProtective) {
    // For protective styles: focus on the style itself, not natural texture
    prompt = `${subject} ${style}. The hairstyle is ${length} with clear definition and authentic styling. Shot from back/3-4 view angle focusing on the hairstyle detail. ${setting}. The hairstyle must be clearly visible and authentic to African hair styling. High detail, photorealistic, professional hair photography with minimal face visibility.`;
  } else {
    // For natural styles: include hair texture
    const texture = mapTextureToPrompt(inputs.hairType);
    prompt = `${subject} ${style}. The hair is ${length} with ${texture} showing natural texture and definition. Shot from back/3-4 view angle focusing on the hair detail. ${setting}. The hair texture must be clearly visible and authentic to African hair types. High detail, photorealistic, professional hair photography with minimal face visibility.`;
  }

  return prompt;
}

/**
 * Get a shortened version of the prompt for display purposes
 */
export function generateShortPrompt(inputs: PromptInputs): string {
  return `${inputs.ethnicity} with ${inputs.desiredStyle} hairstyle, ${inputs.hairType} texture, ${inputs.length} length`;
}

