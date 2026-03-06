import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import db from '@/lib/db';

/**
 * GET /api/admin/users — List all users (admin only).
 * Supports pagination via ?page=1&limit=20
 */
export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10), 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          isAdmin: true,
          createdAt: true,
          lastActiveAt: true,
          _count: {
            select: {
              toolConnections: true,
              apiKeyConnections: true,
              routingLogs: true,
            },
          },
        },
      }),
      db.user.count(),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[API /admin/users] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
