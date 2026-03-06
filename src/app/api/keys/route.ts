import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { encrypt } from '@/services/encryption.service';
import { invalidateDashboardCache } from '@/services/dashboard';
import { logRoute } from '@/services/logger';
import { safeErrorResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const keys = await db.apiKeyConnection.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        toolName: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: keys });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/keys', method: 'GET' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const { toolName, key } = await req.json();

    if (!toolName || !key) {
      return validationErrorResponse('MISSING_FIELDS', 'toolName and key are required');
    }

    // Encrypt the key
    const encryptedKey = encrypt(key);

    const connection = await db.apiKeyConnection.upsert({
      where: {
        userId_toolName: {
          userId: session.userId,
          toolName: toolName,
        }
      },
      create: {
        userId: session.userId,
        toolName,
        encryptedKey: encryptedKey.encrypted,
        iv: encryptedKey.iv,
        authTag: encryptedKey.authTag,
        keyHint: key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***',
        status: 'active',
      },
      update: {
        encryptedKey: encryptedKey.encrypted,
        iv: encryptedKey.iv,
        authTag: encryptedKey.authTag,
        keyHint: key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***',
        status: 'active',
      }
    });

    await logRoute({
      userId: session.userId,
      toolName,
      actionType: 'key_added',
      responseStatus: 200,
    });

    invalidateDashboardCache(session.userId);

    return NextResponse.json({ success: true, data: { id: connection.id, toolName: connection.toolName } });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/keys', method: 'POST' });
  }
}
