import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { createSession, upsertUser, sessionCookieOptions } from '@/services/auth';
import { safeErrorResponse, validationErrorResponse } from '@/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return validationErrorResponse('MISSING_CODE', 'Authorization code required', 400);
    }

    const redirectUri = `${config.appUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.googleClientId!,
        client_secret: config.googleClientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[AUTH] Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(new URL('/login?error=google_failed', config.appUrl));
    }

    const tokens = await tokenRes.json();

    // Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(new URL('/login?error=google_failed', config.appUrl));
    }

    const userInfo = await userInfoRes.json();

    // Create/update user and session
    const userId = await upsertUser({
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.picture,
    });

    const { accessToken, refreshToken, expiresAt } = await createSession(userId, req);

    const response = NextResponse.redirect(new URL('/dashboard', config.appUrl));
    
    response.cookies.set({
      ...sessionCookieOptions(new Date(Date.now() + 15 * 60 * 1000), false),
      value: accessToken,
    });
    response.cookies.set({
      ...sessionCookieOptions(expiresAt, true),
      value: refreshToken,
    });

    return response;
  } catch (err) {
    console.error('[AUTH] Google callback error:', err);
    return NextResponse.redirect(new URL('/login?error=google_failed', config.appUrl));
  }
}
