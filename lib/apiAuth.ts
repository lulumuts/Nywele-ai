import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates API key from request headers
 * @param request - The incoming request
 * @returns boolean indicating if the API key is valid
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return false;
  }

  // Check against environment variable (single key for now)
  const validApiKey = process.env.NYWELE_API_KEY;
  
  if (!validApiKey) {
    console.warn('⚠️ NYWELE_API_KEY not configured in environment variables');
    return false;
  }

  return apiKey === validApiKey;
}

/**
 * Middleware to protect API routes
 * Usage: await requireApiKey(request);
 */
export async function requireApiKey(request: NextRequest): Promise<NextResponse | null> {
  const isValid = validateApiKey(request);
  
  if (!isValid) {
    return NextResponse.json(
      { 
        error: 'Unauthorized',
        message: 'Valid API key required. Include x-api-key header or Authorization: Bearer token'
      },
      { status: 401 }
    );
  }
  
  return null; // null means authorization passed
}

/**
 * Check if request is from internal origin (same domain)
 * This allows your own frontend to access the API without a key
 */
export function isInternalRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow same-origin requests
  if (origin && (origin.includes('localhost') || origin.includes('nywele.ai'))) {
    return true;
  }
  
  if (referer && (referer.includes('localhost') || referer.includes('nywele.ai'))) {
    return true;
  }
  
  return false;
}

/**
 * Flexible API protection - allows internal requests OR valid API key
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  // Allow internal requests (from your own frontend)
  if (isInternalRequest(request)) {
    return null;
  }
  
  // For external requests, require API key
  return requireApiKey(request);
}


