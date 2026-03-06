import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { verifyJwt } from '@/services/auth';
import { safeErrorResponse, successResponse, unauthorizedResponse } from '@/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return unauthorizedResponse();

    const payload = verifyJwt(token);
    if (!payload) return unauthorizedResponse();

    const connections = await db.toolConnection.findMany({
      where: { userId: payload.userId },
      select: {
        id: true,
        toolName: true,
        connectionType: true,
        status: true,
        scopes: true,
        lastSync: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(connections);
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/connections', method: 'GET' });
  }
}
