import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'dev-fallback-secret-change-me'
);

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/security',
  '/privacy',
  '/terms',
  '/integrations',
];

const PUBLIC_API_PATHS = [
  '/api/health',
  '/api/auth/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

// Protect UI routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      const response = NextResponse.redirect(new URL('/login?error=session_expired', request.url));
      return response;
    }
  }

  // Protect API routes (except public)
  if (pathname.startsWith('/api/') && !PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'TOKEN_EXPIRED', message: 'Access token expired' } },
        { status: 401 }
      );
    }
  }

  // CSRF protection for mutating API routes
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { success: false, error: { code: 'CSRF_REJECTED', message: 'Cross-origin request rejected' } },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: { code: 'CSRF_REJECTED', message: 'Invalid origin' } },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};
