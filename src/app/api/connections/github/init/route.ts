import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifySession } from '@/services/auth';
import { safeErrorResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';
import { config } from '@/config';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    if (!config.oauth.githubConfigured) {
      return validationErrorResponse('CONFIG', 'GitHub OAuth is not configured in this environment', 501);
    }

    const state = crypto.randomBytes(32).toString('hex');

    const scopes = 'read:user user:email repo';

    const redirectUri = `${config.appUrl}/api/connections/github/callback`;

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', config.githubClientId!);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('state', state);

    const response = NextResponse.json({ url: authUrl.toString() });

    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/connections/github/init', method: 'POST' });
  }
}
