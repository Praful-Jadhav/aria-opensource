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
      console.error('[CONNECTIONS] GitHub token exchange failed');
      await logRoute({
        userId: payload.userId,
        toolName: 'github',
        actionType: 'connection_test',
        responseStatus: 400,
        errorMessage: 'Token exchange failed',
      });
      return NextResponse.redirect(new URL('/dashboard/connections?error=github_failed', config.appUrl));
    }

    // Get user info to prevent duplicate linking
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();
    const providerUserId = String(user.id);

    if (!providerUserId) {
      return NextResponse.redirect(new URL('/dashboard/connections?error=github_failed', config.appUrl));
    }

    const existing = await db.toolConnection.findUnique({
      where: {
        toolName_providerUserId: { toolName: 'github', providerUserId }
      }
    });

    if (existing && existing.userId !== payload.userId) {
      return NextResponse.redirect(new URL('/dashboard/connections?error=duplicate_linking', config.appUrl));
    }
    const accessEnc = encrypt(tokenData.access_token);

    // Upsert connection (prevents duplicates)
    const connection = await db.toolConnection.upsert({
      where: {
        userId_toolName: {
          userId: payload.userId,
          toolName: 'github',
        },
      },
      create: {
        userId: payload.userId,
        toolName: 'github',
        connectionType: 'oauth',
        providerUserId,
        scopes: tokenData.scope || '',
        status: 'active',
      },
      update: {
        status: 'active',
        scopes: tokenData.scope || '',
        lastSync: new Date(),
      },
    });

    // Store encrypted token
    await db.oAuthToken.upsert({
      where: { connectionId: connection.id },
      create: {
        connectionId: connection.id,
        encryptedAccess: accessEnc.encrypted,
        iv: accessEnc.iv,
        authTag: accessEnc.authTag,
        scope: tokenData.scope,
      },
      update: {
        encryptedAccess: accessEnc.encrypted,
        iv: accessEnc.iv,
        authTag: accessEnc.authTag,
        scope: tokenData.scope,
      },
    });

    await logRoute({
      userId: payload.userId,
      toolName: 'github',
      actionType: 'connection_test',
      responseStatus: 200,
    });

    invalidateDashboardCache(payload.userId);

    return NextResponse.redirect(new URL('/dashboard/connections?connected=github', config.appUrl));
  } catch (err) {
    console.error('[CONNECTIONS] GitHub callback error:', err);
    return NextResponse.redirect(new URL('/dashboard/connections?error=github_failed', config.appUrl));
  }
}

