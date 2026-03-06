import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { verifyJwt } from '@/services/auth';
import { encrypt } from '@/services/encryption.service';
import { invalidateDashboardCache } from '@/services/dashboard';
import { logRoute } from '@/services/logger';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', config.appUrl));

    const payload = verifyJwt(token);
    if (!payload) return NextResponse.redirect(new URL('/login', config.appUrl));

    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/connections?error=missing_code', config.appUrl));
    }

    const redirectUri = `${config.appUrl}/api/connections/google-workspace/callback`;

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
      console.error('[CONNECTIONS] Google Workspace token exchange failed');
      await logRoute({
        userId: payload.userId,
        toolName: 'google_workspace',
        actionType: 'connection_test',
        responseStatus: tokenRes.status,
        errorMessage: 'Token exchange failed',
      });
      return NextResponse.redirect(new URL('/dashboard/connections?error=google_failed', config.appUrl));
    }

    const tokens = await tokenRes.json();

    // Gather provider user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json();
    const providerUserId = String(userInfo.id);

    if (!providerUserId) {
      return NextResponse.redirect(new URL('/dashboard/connections?error=google_failed', config.appUrl));
    }

    const existing = await db.toolConnection.findUnique({
      where: {
        toolName_providerUserId: { toolName: 'google_workspace', providerUserId }
      }
    });

    if (existing && existing.userId !== payload.userId) {
      return NextResponse.redirect(new URL('/dashboard/connections?error=duplicate_linking', config.appUrl));
    }

    // Encrypt tokens
    const accessEnc = encrypt(tokens.access_token);
    const refreshEnc = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;

    // Upsert connection (prevents duplicates via @@unique)
    const connection = await db.toolConnection.upsert({
      where: {
        userId_toolName: {
          userId: payload.userId,
          toolName: 'google_workspace',
        },
      },
      create: {
        userId: payload.userId,
        toolName: 'google_workspace',
        connectionType: 'oauth',
        providerUserId,
        scopes: tokens.scope || '',
        status: 'active',
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
      update: {
        status: 'active',
        scopes: tokens.scope || '',
        lastSync: new Date(),
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
    });

    // Store encrypted tokens
    await db.oAuthToken.upsert({
      where: { connectionId: connection.id },
      create: {
        connectionId: connection.id,
        encryptedAccess: accessEnc.encrypted,
        iv: accessEnc.iv,
        authTag: accessEnc.authTag,
        encryptedRefresh: refreshEnc?.encrypted,
        ivRefresh: refreshEnc?.iv,
        authTagRefresh: refreshEnc?.authTag,
        scope: tokens.scope,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
      update: {
        encryptedAccess: accessEnc.encrypted,
        iv: accessEnc.iv,
        authTag: accessEnc.authTag,
        encryptedRefresh: refreshEnc?.encrypted,
        ivRefresh: refreshEnc?.iv,
        authTagRefresh: refreshEnc?.authTag,
        scope: tokens.scope,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
    });

    await logRoute({
      userId: payload.userId,
      toolName: 'google_workspace',
      actionType: 'connection_test',
      responseStatus: 200,
    });

    invalidateDashboardCache(payload.userId);

    return NextResponse.redirect(new URL('/dashboard/connections?connected=google_workspace', config.appUrl));
  } catch (err) {
    console.error('[CONNECTIONS] Google Workspace callback error:', err);
    return NextResponse.redirect(new URL('/dashboard/connections?error=google_failed', config.appUrl));
  }
}

