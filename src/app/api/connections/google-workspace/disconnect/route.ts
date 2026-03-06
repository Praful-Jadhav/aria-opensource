import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { invalidateDashboardCache } from '@/services/dashboard';
import { safeErrorResponse, unauthorizedResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const connection = await db.toolConnection.findUnique({
      where: {
        userId_toolName: {
          userId: session.userId,
          toolName: 'google_workspace',
        },
      },
    });

    if (connection) {
      // Soft delete: keep the record but set status to revoked
      await db.toolConnection.update({
        where: { id: connection.id },
        data: { status: 'revoked' },
      });
      
      // We keep the oAuthToken record around, but can nullify the access token if needed.
      // Easiest is to leave it to maintain audit history, or delete the row entirely for safety.
      // Let's delete the sensitive tokens to be secure.
      await db.oAuthToken.deleteMany({
        where: { connectionId: connection.id }
      });

      invalidateDashboardCache(session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/connections/google-workspace/disconnect', method: 'POST' });
  }
}
