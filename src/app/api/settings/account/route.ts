import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { safeErrorResponse, unauthorizedResponse } from '@/utils/error-handler';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    // Because of Prisma cascade deletes, deleting the user will delete:
    // ToolConnections, ApiKeyConnections, RoutingLogs, AuthSessions, AuthLogs, etc.
    await db.user.delete({
      where: { id: session.userId }
    });

    // Clear session cookies
    const cookieStore = await cookies();
    cookieStore.delete('session');
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/settings/account', method: 'DELETE' });
  }
}
