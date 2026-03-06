import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { verifyJwt } from '@/services/auth';
import { encrypt } from '@/services/encryption.service';
import db from '@/lib/db';
import { invalidateDashboardCache } from '@/services/dashboard';
import { logRoute } from '@/services/logger';

export async function GET(req: NextRequest) {
  if (!config.oauth.googleConfigured) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_CONFIGURED', message: 'Google OAuth not configured' } },
      { status: 503 }
    );
  }

  const redirectUri = `${config.appUrl}/api/connections/google-workspace/callback`;
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ].join(' ');

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', config.googleClientId!);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(url.toString());
}

