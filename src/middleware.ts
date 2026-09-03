import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedApiRoutes = ['/api/chat', '/api/ai', '/api/documents', '/api/fraud', '/api/urls', '/api/budget', '/api/study', '/api/teacher', '/api/voice', '/api/users', '/api/admin', '/api/profile', '/api/account', '/api/settings', '/api/memory', '/api/audit', '/api/orchestrate', '/api/sources', '/api/verification', '/api/countries', '/api/notifications', '/api/cost-plans'];

const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/refresh', '/api/education', '/api/chat/department'];

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());

function isAllowedOrigin(origin: string | null): string {
  if (!origin) return ALLOWED_ORIGINS[0] || 'http://localhost:3000';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0] || 'http://localhost:3000';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '0');

  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigin = isAllowedOrigin(origin);
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
    if (isPublicApi) {
      return response;
    }

    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
    if (isProtectedApi) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
