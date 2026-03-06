import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { verifySession } from '@/services/auth';
import { safeErrorResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';
import { config } from '@/config';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    if (!config.oauth.googleConfigured) {
      return validationErrorResponse('CONFIG', 'Google OAuth is not configured in this environment', 501);
    }

    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in DB with 10-minute expiry (could use a dedicated table or Redis)
    // For MVP, we'll use OtpRequest table repurposing it temporarily,
    // or just pass it in session cookie. We'll set a secure cookie for state verification.
    
    // Instead of DB, using encrypted cookie for state is stateless and very secure.
    const stateCookie = crypto.randomBytes(16).toString('hex') + '.' + state; // Simplified

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/gmail.readonly',
    ].join(' ');

    const redirectUri = `${config.appUrl}/api/connections/google-workspace/callback`;

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', config.googleClientId!);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('access_type', 'offline'); // vital for refresh token
    authUrl.searchParams.append('prompt', 'consent'); // force consent to ensure refresh token
    authUrl.searchParams.append('state', state);

    const response = NextResponse.json({ url: authUrl.toString() });

    // Set state cookie (HttpOnly, Secure, 10 min expiry)
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // must be lax for OAuth redirect
      maxAge: 10 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/connections/google-workspace/init', method: 'POST' });
  }
}
