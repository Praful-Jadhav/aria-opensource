import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { safeErrorResponse, unauthorizedResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const tool = searchParams.get('tool');

    const where: any = { userId: session.userId };
    if (tool && tool.trim() !== '') {
      where.toolName = { contains: tool };
    }

    const [logs, total] = await Promise.all([
      db.routingLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          toolName: true,
          actionType: true,
          responseStatus: true,
          errorMessage: true,
          createdAt: true,
        }
      }),
      db.routingLog.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/logs', method: 'GET' });
  }
}
