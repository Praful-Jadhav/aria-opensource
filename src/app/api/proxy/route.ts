import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyJwt } from '@/services/auth';
import { decrypt } from '@/services/encryption.service';
import { logRoute } from '@/services/logger';
import { ensureValidToken } from '@/services/token-refresh.service';
import { safeErrorResponse, successResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';
import { z } from 'zod';

const schema = z.object({
  toolName: z.string(),
  endpoint: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  body: z.any().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return unauthorizedResponse();

    const payload = verifyJwt(token);
    if (!payload) return unauthorizedResponse();

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse('VALIDATION', parsed.error.issues[0].message);
    }

    const { toolName, endpoint, method, body: reqBody, headers: reqHeaders } = parsed.data;

    // Find API key or OAuth connection for this tool
    const apiKey = await db.apiKeyConnection.findFirst({
      where: { userId: payload.userId, toolName, status: 'active' },
    });

    const oauthConn = !apiKey
      ? await db.toolConnection.findFirst({
          where: { userId: payload.userId, toolName, status: 'active' },
          include: { oauthToken: true },
        })
      : null;

    if (!apiKey && !oauthConn) {
      return validationErrorResponse('NO_CREDENTIALS', `No active credentials found for ${toolName}`, 400);
    }

    // Decrypt credentials
    let authHeader: string;
    if (apiKey) {
      const decryptedKey = decrypt({
        encrypted: apiKey.encryptedKey,
        iv: apiKey.iv,
        authTag: apiKey.authTag,
      });
      authHeader = `Bearer ${decryptedKey}`;
    } else {
      const validToken = await ensureValidToken(oauthConn!.id, payload.userId);
      if (!validToken) {
        return validationErrorResponse('EXPIRED_CREDENTIALS', `OAuth token expired and could not be refreshed for ${toolName}`, 401);
      }
      authHeader = `Bearer ${validToken}`;
    }

    // Execute request
    const startTime = Date.now();
    let response: Response;
    let retried = false;

    const executeRequest = async (attempt: number): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s configurable timeout
      try {
        const res = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
            ...reqHeaders,
          },
          body: reqBody && method !== 'GET' ? JSON.stringify(reqBody) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return res;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') throw new Error('TIMEOUT');
        throw new Error('NETWORK_ERROR');
      }
    };

    try {
      response = await executeRequest(1);
    } catch (err: any) {
      // Retry once on network failure with backoff
      retried = true;
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s backoff
      try {
        response = await executeRequest(2);
      } catch (retryErr: any) {
        const errorType = retryErr.message === 'TIMEOUT' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR';
        await logRoute({
          userId: payload.userId,
          toolName,
          actionType: 'api_call',
          responseStatus: 504,
          durationMs: Date.now() - startTime,
          errorMessage: errorType,
        });
        return NextResponse.json({
          success: false,
          error: { code: errorType, message: 'Provider connection failed or timed out' },
        }, { status: 504 });
      }
    }

    const durationMs = Date.now() - startTime;
    const responseData = await response.text();

    let errorCategory: string | undefined;
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) errorCategory = 'AUTH_ERROR';
      else if (response.status >= 500) errorCategory = 'PROVIDER_ERROR';
      else errorCategory = 'CLIENT_ERROR';
    }

    // Log the routing action (internal visibility)
    await logRoute({
      userId: payload.userId,
      toolName,
      actionType: 'api_call',
      responseStatus: response.status,
      durationMs,
      errorMessage: errorCategory ? `${errorCategory}: ${responseData.slice(0, 500)}` : undefined,
    });

    // Update last used
    if (apiKey) {
      await db.apiKeyConnection.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });
    }

    // Prevent leaking provider error details to frontend
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: {
          code: errorCategory,
          message: 'Provider request failed. Check logs for details.',
        },
      }, { status: response.status });
    }

    // Parse valid response
    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch {
      parsedResponse = responseData;
    }

    return successResponse({
      status: response.status,
      data: parsedResponse,
      durationMs,
      retried,
    });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/proxy', method: 'POST' });
  }
}

