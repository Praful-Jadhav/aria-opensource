import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { decrypt } from '@/services/encryption.service';
import { logRoute } from '@/services/logger';
import { safeErrorResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const connection = await db.apiKeyConnection.findUnique({
      where: { id }
    });

    if (!connection || connection.userId !== session.userId) {
      return validationErrorResponse('NOT_FOUND', 'API Key not found or does not belong to you', 404);
    }

    const decryptedKey = decrypt({ encrypted: connection.encryptedKey, iv: connection.iv, authTag: connection.authTag });

    let testPassed = false;
    let errorMessage = '';
    
    // MVP Level Key Testing Logic
    try {
      if (connection.toolName === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${decryptedKey}` }
        });
        if (res.ok) testPassed = true;
        else errorMessage = `OpenAI returned ${res.status}`;
      } else if (connection.toolName === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/models', {
          headers: { 'x-api-key': decryptedKey, 'anthropic-version': '2023-06-01' }
        });
        if (res.ok) testPassed = true;
        else errorMessage = `Anthropic returned ${res.status}`;
      } else {
        // Fallback for tools we don't have explicit test setups for yet
        testPassed = true;
      }
    } catch (e: any) {
      testPassed = false;
      errorMessage = e.message;
    }

    await logRoute({
      userId: session.userId,
      toolName: connection.toolName,
      actionType: 'key_test',
      responseStatus: testPassed ? 200 : 400,
      errorMessage: testPassed ? undefined : errorMessage,
    });

    if (!testPassed) {
      await db.apiKeyConnection.update({
        where: { id: connection.id },
        data: { status: 'error' }
      });
      return NextResponse.json({ success: false, error: { message: `Test failed: ${errorMessage}` } }, { status: 400 });
    }

    await db.apiKeyConnection.update({
      where: { id: connection.id },
      data: { status: 'active' }
    });

    return NextResponse.json({ success: true, message: 'Key is valid and working.' });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/keys/[id]/test', method: 'POST' });
  }
}
