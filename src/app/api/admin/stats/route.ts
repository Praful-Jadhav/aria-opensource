import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import db from '@/lib/db';

/**
 * GET /api/admin/stats — Admin dashboard statistics.
 * Requires authenticated admin user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify admin status
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [totalUsers, activeUsers, totalConnections, totalApiKeys, totalLogs] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.toolConnection.count({ where: { status: 'active' } }),
      db.apiKeyConnection.count({ where: { status: 'active' } }),
      db.routingLog.count(),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalConnections,
        totalApiKeys,
        totalLogs,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[API /admin/stats] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
