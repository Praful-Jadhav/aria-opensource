import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { invalidateDashboardCache } from '@/services/dashboard';
import { logRoute } from '@/services/logger';
import { safeErrorResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await db.apiKeyConnection.delete({
      where: { id }
    });

    await logRoute({
      userId: session.userId,
      toolName: connection.toolName,
      actionType: 'key_deleted',
      responseStatus: 200,
    });

    invalidateDashboardCache(session.userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/keys/[id]', method: 'DELETE' });
  }
}
