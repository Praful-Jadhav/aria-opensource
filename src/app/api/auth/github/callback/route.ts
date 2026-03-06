import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { createSession, upsertUser, sessionCookieOptions } from '@/services/auth';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', config.appUrl));
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.githubClientId!,
        client_secret: config.githubClientSecret!,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('[AUTH] GitHub token exchange failed:', tokenData);
      return NextResponse.redirect(new URL('/login?error=github_failed', config.appUrl));
    }

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // Get email if not public
    let email = user.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = await emailRes.json();
      email = emails.find((e: { primary: boolean }) => e.primary)?.email || emails[0]?.email;
    }

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=no_email', config.appUrl));
    }

    const userId = await upsertUser({
      email,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
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
    console.error('[AUTH] GitHub callback error:', err);
    return NextResponse.redirect(new URL('/login?error=github_failed', config.appUrl));
  }
}
