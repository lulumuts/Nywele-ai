import { NextRequest, NextResponse } from 'next/server';
import { generateImagePrompt } from '@/lib/promptGenerator';
import { trackStyleGeneration } from '@/lib/analytics';
import { findStyleImage, getStyleCostEstimate, getStyleInfo } from '@/lib/imageLibrary';
import { requireAuth } from '@/lib/apiAuth';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

type AnthropicContentBlock = { type: string; text?: string };

/**
 * Calls Anthropic Messages API with the style prompt. Returns assistant text or null on failure.
 */
async function callClaudeHaiku(userPrompt: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const raw = await res.text();

    if (!res.ok) {
      let message = raw.slice(0, 500);
      try {
        const errJson = JSON.parse(raw) as { error?: { message?: string } };
        if (errJson?.error?.message) message = errJson.error.message;
      } catch {
        /* keep truncated body */
      }
      console.error('Anthropic API error:', res.status, message);
      return null;
    }

    let data: { content?: AnthropicContentBlock[] };
    try {
      data = JSON.parse(raw) as { content?: AnthropicContentBlock[] };
    } catch {
      console.error('Anthropic API: invalid JSON response');
      return null;
    }

    const texts = (data.content ?? [])
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text);
    const combined = texts.join('\n').trim();
    return combined.length > 0 ? combined : null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Anthropic request failed:', msg);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { hairType, styleName, ethnicity, length, vibe } = body;

    // Validation
    if (!hairType || !styleName) {
      return NextResponse.json(
        { error: 'Hair type and style name are required' },
        { status: 400 }
      );
    }

    // Generate the detailed, bias-countering prompt
    const detailedPrompt = generateImagePrompt({
      ethnicity: ethnicity || 'Black Woman',
      hairType,
      desiredStyle: styleName,
      length: length || 'Shoulder-Length',
      vibe: vibe || 'Professional Studio Portrait'
    });

    console.log('🎨 Generated style prompt:', detailedPrompt);

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🚀 Calling Anthropic Claude Haiku (messages API)...');

        const assistantText = await callClaudeHaiku(detailedPrompt);

        if (assistantText) {
          console.log('✅ Anthropic API responded');

          const lengthCategory =
            length === 'Close-Cropped' || length === 'Ear-Length'
              ? 'short'
              : length === 'Chin-Length' || length === 'Shoulder-Length'
                ? 'medium'
                : 'long';

          const styleImage = findStyleImage(styleName, hairType, lengthCategory, 'back');
          const imageUrl =
            styleImage?.url ||
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';

          trackStyleGeneration({
            hairType,
            style: styleName,
            ethnicity,
            length,
            vibe,
            success: true,
          }).catch((err) => console.error('Analytics tracking failed:', err));

          return NextResponse.json({
            success: true,
            data: {
              imageUrl,
              description: assistantText,
              hairType,
              styleName,
              ethnicity,
              length,
              vibe,
              prompt: detailedPrompt,
              generatedBy: CLAUDE_MODEL,
              aiGenerated: true,
            },
          });
        }

        console.log('⚠️ No assistant text in Anthropic response, using fallback');
      } catch (claudeError: unknown) {
        const message = claudeError instanceof Error ? claudeError.message : String(claudeError);
        console.error('❌ Anthropic request failed:', message);
        console.log('Falling back to curated images');
      }
    }

    // Use curated image library for authentic representation
    const lengthCategory =
      length === 'Close-Cropped' || length === 'Ear-Length'
        ? 'short'
        : length === 'Chin-Length' || length === 'Shoulder-Length'
          ? 'medium'
          : 'long';

    const styleImage = findStyleImage(
      styleName,
      hairType,
      lengthCategory,
      'back' // Prefer back view
    );

    const imageUrl = styleImage?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
    const costEstimate = getStyleCostEstimate(styleName);
    const styleInfo = getStyleInfo(styleName);

    // Track fallback usage
    trackStyleGeneration({
      hairType,
      style: styleName,
      ethnicity,
      length,
      vibe,
      success: false, // Using curated images, not AI-generated
    }).catch((err) => console.error('Analytics tracking failed:', err));

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        description: detailedPrompt,
        hairType,
        styleName,
        ethnicity,
        length,
        vibe,
        prompt: detailedPrompt,
        generatedBy: styleImage?.source || 'curated-library',
        fallback: true,
        costEstimate,
        styleInfo,
        imageAttribution: styleImage?.attribution,
      },
    });
  } catch (error) {
    console.error('Style API error:', error);

    // Return error with safe fallback
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate style inspiration',
        data: {
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          description: 'African hair style inspiration',
          fallback: true,
        },
      },
      { status: 500 }
    );
  }
}
