/**
 * Hair Passport Export Utility
 * 
 * Generates a portable hair profile document that users can share with stylists
 * or use when traveling to different locations.
 */

import type { UserProfile } from '@/types/userProfile';

export interface HairPassportData {
  name: string;
  email: string;
  hairType: string;
  porosity?: string;
  length?: string;
  density?: string;
  strandThickness?: string;
  elasticity?: string;
  scalpCondition?: string;
  hairGoals: string[];
  concerns: string[];
  climate?: string;
  location?: string;
  allergies?: string[];
  sensitivities?: string[];
  preferences?: string[];
  analysisResults?: any;
  generatedDate: string;
  version: string;
}

/**
 * Generate Hair Passport data from user profile
 */
export function generateHairPassportData(
  profile: UserProfile,
  analysisResults?: any
): HairPassportData {
  return {
    name: profile.name,
    email: profile.email,
    hairType: profile.hairType,
    porosity: profile.hairPorosity || undefined,
    length: profile.hairLength || undefined,
    density: profile.hairDensity || undefined,
    strandThickness: profile.strandThickness || undefined,
    elasticity: profile.elasticity || undefined,
    scalpCondition: profile.scalpCondition || undefined,
    hairGoals: profile.hairGoals || [],
    concerns: profile.currentConcerns || [],
    climate: profile.climate || undefined,
    location: undefined, // Not available in UserProfile type
    allergies: profile.ingredientAllergies || [],
    sensitivities: profile.ingredientSensitivities || [],
    preferences: profile.preferredProductAttributes || [],
    analysisResults: analysisResults,
    generatedDate: new Date().toISOString(),
    version: '1.0'
  };
}

/**
 * Generate text format Hair Passport
 */
export function generateHairPassportText(
  profile: UserProfile,
  analysisResults?: any
): string {
  const data = generateHairPassportData(profile, analysisResults);
  const date = new Date(data.generatedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let passportText = `
╔═══════════════════════════════════════════════════════════╗
║              HAIR PROFILE PASSPORT                        ║
║              Nywele.ai Portable Hair Companion            ║
╚═══════════════════════════════════════════════════════════╝

Generated: ${date}
Version: ${data.version}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONAL INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${data.name}
Email: ${data.email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HAIR CHARACTERISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hair Type: ${data.hairType.toUpperCase()}
${data.porosity ? `Porosity: ${data.porosity.charAt(0).toUpperCase() + data.porosity.slice(1)}` : ''}
${data.length ? `Length: ${data.length.charAt(0).toUpperCase() + data.length.slice(1)}` : ''}
${data.density ? `Density: ${data.density.charAt(0).toUpperCase() + data.density.slice(1)}` : ''}
${data.strandThickness ? `Strand Thickness: ${data.strandThickness.charAt(0).toUpperCase() + data.strandThickness.slice(1)}` : ''}
${data.elasticity ? `Elasticity: ${data.elasticity.charAt(0).toUpperCase() + data.elasticity.slice(1)}` : ''}
${data.scalpCondition ? `Scalp Condition: ${data.scalpCondition.charAt(0).toUpperCase() + data.scalpCondition.slice(1)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HAIR GOALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.hairGoals.length > 0 
  ? data.hairGoals.map(goal => `• ${goal.charAt(0).toUpperCase() + goal.slice(1)}`).join('\n')
  : 'No specific goals set'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONCERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.concerns.length > 0 
  ? data.concerns.map(concern => `• ${concern.charAt(0).toUpperCase() + concern.slice(1)}`).join('\n')
  : 'No specific concerns'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENTAL FACTORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.climate ? `Climate: ${data.climate.charAt(0).toUpperCase() + data.climate.slice(1)}` : 'Climate: Not specified'}
${data.location ? `Location: ${data.location}` : 'Location: Not specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALLERGIES & SENSITIVITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.allergies && data.allergies.length > 0 
  ? `Allergies: ${data.allergies.join(', ')}`
  : 'Allergies: None specified'
}

${data.sensitivities && data.sensitivities.length > 0 
  ? `Sensitivities: ${data.sensitivities.join(', ')}`
  : 'Sensitivities: None specified'
}

${data.preferences && data.preferences.length > 0 
  ? `Preferences: ${data.preferences.join(', ')}`
  : 'Preferences: None specified'
}

`;

  // Add analysis results if available
  if (analysisResults) {
    passportText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECENT ANALYSIS RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${typeof analysisResults.overallQuality === 'number' 
  ? `Overall Quality Score: ${analysisResults.overallQuality}/100` 
  : ''}
${analysisResults.health?.healthScore 
  ? `Health Score: ${analysisResults.health.healthScore}/100` 
  : ''}
${analysisResults.detectedStyle?.style 
  ? `Detected Style: ${analysisResults.detectedStyle.style.replace(/-/g, ' ')}` 
  : ''}
`;
  }

  passportText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Share this profile with your stylist for personalized service.
This passport travels with you - use it anywhere in the world!

Generated by Nywele.ai
For questions or updates, visit your profile at nywele.ai/profile

`;

  return passportText;
}

/**
 * Download Hair Passport as text file
 */
export function downloadHairPassport(
  profile: UserProfile,
  analysisResults?: any
): void {
  const passportText = generateHairPassportText(profile, analysisResults);
  const blob = new Blob([passportText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hair-passport-${profile.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate JSON format Hair Passport (for API integration)
 */
export function generateHairPassportJSON(
  profile: UserProfile,
  analysisResults?: any
): string {
  const data = generateHairPassportData(profile, analysisResults);
  return JSON.stringify(data, null, 2);
}

/**
 * Copy Hair Passport to clipboard
 */
export async function copyHairPassportToClipboard(
  profile: UserProfile,
  analysisResults?: any
): Promise<boolean> {
  try {
    const passportText = generateHairPassportText(profile, analysisResults);
    await navigator.clipboard.writeText(passportText);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}


