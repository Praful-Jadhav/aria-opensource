import db from '@/lib/db';
import { encrypt, decrypt } from '@/services/encryption.service';
import { logRoute } from '@/services/logger';
import { config } from '@/config';

const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes buffer

export async function ensureValidToken(connectionId: string, userId: string): Promise<string | null> {
  const oauthToken = await db.oAuthToken.findUnique({
    where: { connectionId },
    include: { connection: true },
  });

  if (!oauthToken) return null;

  // Decrypt the access token to check or return it
  const currentAccess = decrypt({
    encrypted: oauthToken.encryptedAccess,
    iv: oauthToken.iv,
    authTag: oauthToken.authTag,
  });

  // If token is valid and not expiring soon, return it
  if (!oauthToken.expiresAt || oauthToken.expiresAt.getTime() > Date.now() + EXPIRY_BUFFER_MS) {
    return currentAccess;
  }

  // Token is expiring soon or expired, attempt refresh
  if (!oauthToken.encryptedRefresh) {
    // No refresh token available, mark connection as expired
    await markConnectionExpired(connectionId, userId, oauthToken.connection.toolName, 'No refresh token available');
    return null;
  }

  try {
    const refreshToken = decrypt({
      encrypted: oauthToken.encryptedRefresh,
      iv: oauthToken.ivRefresh!,
      authTag: oauthToken.authTagRefresh!,
    });

    let newTokenData: any;

    // Handle provider-specific refresh logic
    if (oauthToken.connection.toolName === 'google_workspace') {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.googleClientId!,
          client_secret: config.googleClientSecret!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!res.ok) throw new Error(`Google refresh failed: ${res.status}`);
      newTokenData = await res.json();
    } else {
      // GitHub doesn't typically expire access tokens unless configured for short-lived tokens,
      // but if it does, it uses a similar refresh flow.
      throw new Error(`Auto-refresh not supported for ${oauthToken.connection.toolName}`);
    }

    // Encrypt new token
    const accessEnc = encrypt(newTokenData.access_token);
    
    // Some providers rotate the refresh token
    const refreshEnc = newTokenData.refresh_token 
      ? encrypt(newTokenData.refresh_token) 
      : null;

    // Atomically update DB
    await db.oAuthToken.update({
      where: { id: oauthToken.id },
      data: {
        encryptedAccess: accessEnc.encrypted,
        iv: accessEnc.iv,
        authTag: accessEnc.authTag,
        ...(refreshEnc ? {
          encryptedRefresh: refreshEnc.encrypted,
          ivRefresh: refreshEnc.iv,
          authTagRefresh: refreshEnc.authTag,
        } : {}),
        expiresAt: newTokenData.expires_in
          ? new Date(Date.now() + newTokenData.expires_in * 1000)
          : null,
      },
    });

    await db.toolConnection.update({
      where: { id: connectionId },
      data: {
        lastSync: new Date(),
        expiresAt: newTokenData.expires_in
          ? new Date(Date.now() + newTokenData.expires_in * 1000)
          : null,
      },
    });

    // Log success
    await logRoute({
      userId,
      toolName: oauthToken.connection.toolName,
      actionType: 'oauth_refresh',
      responseStatus: 200,
    });

    return newTokenData.access_token;
  } catch (err: any) {
    console.error(`[TOKEN_REFRESH] Failed to refresh token for connection ${connectionId}:`, err);
    await markConnectionExpired(connectionId, userId, oauthToken.connection.toolName, err.message);
    return null; // Return null gracefully, let routing engine handle the failure
  }
}

async function markConnectionExpired(connectionId: string, userId: string, toolName: string, reason: string) {
  await db.toolConnection.update({
    where: { id: connectionId },
    data: { status: 'expired' },
  });

  await logRoute({
    userId,
    toolName,
    actionType: 'oauth_refresh',
    responseStatus: 401,
    errorMessage: `Token refresh failed: ${reason}`,
  });
}
