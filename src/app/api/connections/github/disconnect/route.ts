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
          toolName: 'github',
        },
      },
    });

    if (connection) {
      await db.toolConnection.update({
        where: { id: connection.id },
        data: { status: 'revoked' },
      });
      
      await db.oAuthToken.deleteMany({
        where: { connectionId: connection.id }
      });

      invalidateDashboardCache(session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/connections/github/disconnect', method: 'POST' });
  }
}
