import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { safeErrorResponse, unauthorizedResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const sessions = await db.authSession.findMany({
      where: { 
        userId: session.userId,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/settings/sessions', method: 'GET' });
  }
}
