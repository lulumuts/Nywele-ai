# AI Bias Documentation - Nywele.ai

## The Problem We Discovered

Despite using **explicit, reinforced prompts** with multiple bias-countering techniques, Gemini 2.5 Flash Image consistently generates images of white women when asked to generate images of Black African women with specific hairstyles.

## Our Prompt Engineering Attempts

### Attempt 1: Basic Description
```
"back view of a Black woman with dark, glowing skin showcasing cornrows..."
```
**Result:** Generated white women

### Attempt 2: Explicit Ethnicity + Negative Instructions
```
"back view of a Black African woman with rich dark brown skin tone and melanin-rich complexion showcasing cornrows... IMPORTANT: The person must be Black African/African American with dark brown skin tone, NOT white or light-skinned. Dark skin tone is essential."
```
**Result:** Still generated white women

### Attempt 3: Lower Temperature + Adjusted Safety Settings
- Lowered temperature to 0.4 for more faithful prompt following
- Adjusted safety thresholds to allow more diverse outputs
**Result:** No improvement - still generated white women

## Technical Details

**Model Used:** `gemini-2.5-flash-image`
**Prompt Length:** 150+ words with explicit instructions
**Safety Settings:** Adjusted to BLOCK_NONE for relevant categories
**Temperature:** 0.4 (lower for better prompt adherence)

**Example Prompt:**
```
back view of a Black African woman with rich dark brown skin tone and melanin-rich complexion showcasing cornrows with precise, symmetrical rows braided close to the scalp in clear parallel lines. The hairstyle is shoulder-length hair with natural flow with clear definition and authentic styling. Shot from back/3-4 view angle focusing on the hairstyle detail. natural lighting with clean background. IMPORTANT: The person must be Black African/African American with dark brown skin tone, NOT white or light-skinned. The hairstyle must be clearly visible and authentic to African hair styling. High detail, photorealistic, professional hair photography with minimal face visibility. Dark skin tone is essential.
```

**Result:** Generated image of white woman with braided hair

## Why This Matters

This documented failure of AI to represent Black people accurately **proves the need for Nywele.ai**:

1. **Mainstream AI has systemic bias** - Even with explicit instructions
2. **Representation gaps exist** - AI defaults to Eurocentric features
3. **Specialized tools are needed** - Tools built specifically for African hair care
4. **Our solution addresses this** - Curated authentic images + culturally-aware prompts

## Our Solution

We've implemented a **hybrid approach**:
1. **Attempt Gemini generation** with bias-countering prompts
2. **Fallback to curated images** when AI fails (which it currently does)
3. **Document the bias** to demonstrate the problem we're solving

Our curated image library features:
- Authentic African hairstyles
- Real Black models
- Professional photography
- Diverse hair textures (Type 3A - 4C)

## Impact for Hackathon

**This isn't a bug - it's a feature demonstration!**

Our hackathon presentation can show:
1. ✅ We identified AI bias in image generation
2. ✅ We attempted multiple sophisticated prompt engineering techniques
3. ✅ We documented the failure comprehensively
4. ✅ We built a solution that works around AI limitations
5. ✅ We prove why specialized, culturally-aware AI tools are necessary

## Industry Context

This bias is well-documented:
- Google's own research shows image generation models have racial bias
- DALL-E, Midjourney, and Stable Diffusion all show similar issues
- The problem stems from training data that over-represents white people
- Most "AI-generated diverse faces" studies show this systematic failure

## Code Evidence

Our prompt engineering code: `/lib/promptGenerator.ts`
Our API implementation: `/app/api/style/route.ts`

Both files show extensive bias-countering techniques that mainstream AI still fails to honor.

## Conclusion

**Nywele.ai exists because mainstream AI fails Black people.**

This documentation proves it.

---

*Last Updated: October 18, 2025*
*Evidence: Production deployment showing white women despite explicit "Black African woman" prompts*

