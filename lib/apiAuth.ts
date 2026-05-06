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

function hostFromUrlish(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function isTrustedInternalHost(host: string | null): boolean {
  if (!host) return false;
  return host === 'localhost' || host.startsWith('localhost:') || host === 'nywele.ai' || host.endsWith('.nywele.ai');
}

/**
 * Check if request is from internal origin (same domain)
 * This allows your own frontend to access the API without a key
 */
export function isInternalRequest(request: NextRequest): boolean {
  const originHost = hostFromUrlish(request.headers.get('origin'));
  const refererHost = hostFromUrlish(request.headers.get('referer'));

  // If the request includes an Origin/Referer and it matches the current host, it’s internal.
  // This covers Vercel previews/prod automatically without maintaining an allowlist.
  const requestHost = request.nextUrl.host;
  if (originHost && originHost === requestHost) return true;
  if (refererHost && refererHost === requestHost) return true;

  // Explicitly trust these common internal hosts (useful in dev or when upstream strips Origin).
  if (isTrustedInternalHost(originHost)) return true;
  if (isTrustedInternalHost(refererHost)) return true;

  // Support Vercel preview/prod where the host can differ between app and API subdomains/routes.
  // This keeps “internal” behavior for same-deployment calls.
  if (originHost && originHost.endsWith('.vercel.app')) return true;
  if (refererHost && refererHost.endsWith('.vercel.app')) return true;

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


