import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';

export async function GET(req: NextRequest) {
  if (!config.oauth.githubConfigured) {
    return NextResponse.redirect(
      new URL('/login?error=oauth_not_configured', req.url)
    );
  }

  const redirectUri = `${config.appUrl}/api/auth/github/callback`;
  const scopes = 'read:user user:email';

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', config.githubClientId!);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scopes);

  return NextResponse.redirect(url.toString());
}
