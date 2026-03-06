import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { getDashboardData, invalidateDashboardCache } from '@/services/dashboard';
import { safeErrorResponse, unauthorizedResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const data = await getDashboardData(session.userId);

    // Get active sessions count for the overview card
    const activeSessionsCount = await db.authSession.count({
      where: {
        userId: session.userId,
        expiresAt: { gt: new Date() },
      },
    });

    const responseData = {
      ...data,
      activeSessionsCount,
      // API Calls Today calculation
      apiCallsToday: data.recentLogs.filter(
        (log) => log.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length, // Note: real app would query DB for exact count today, 
                // but since we pull top 10 logs minimum, we might need a separate count query.
                // Let's optimize:
    };

    // Correct exact API calls today count
    const actualApiCallsToday = await db.routingLog.count({
      where: {
        userId: session.userId,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    
    responseData.apiCallsToday = actualApiCallsToday;

    return NextResponse.json({ success: true, data: responseData });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/dashboard/summary', method: 'GET' });
  }
}

// Allow clients to force bust cache (e.g. after adding a key)
export async function DELETE(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    invalidateDashboardCache(session.userId);
    return NextResponse.json({ success: true, message: 'Cache invalidated' });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/dashboard/summary', method: 'DELETE' });
  }
}
