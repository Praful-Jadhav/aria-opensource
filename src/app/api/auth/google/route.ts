import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';

export async function GET(req: NextRequest) {
  if (!config.oauth.googleConfigured) {
    return NextResponse.redirect(
      new URL('/login?error=oauth_not_configured', req.url)
    );
  }

  const redirectUri = `${config.appUrl}/api/auth/google/callback`;
  const scopes = ['openid', 'email', 'profile'].join(' ');

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', config.googleClientId!);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(url.toString());
}
