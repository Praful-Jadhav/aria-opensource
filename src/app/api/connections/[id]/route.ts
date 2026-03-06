import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { verifyJwt } from '@/services/auth';
import { invalidateDashboardCache } from '@/services/dashboard';
import { safeErrorResponse, successResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return unauthorizedResponse();

    const payload = verifyJwt(token);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;

    const connection = await db.toolConnection.findFirst({
      where: { id, userId: payload.userId },
    });

    if (!connection) {
      return validationErrorResponse('NOT_FOUND', 'Connection not found', 404);
    }

    await db.toolConnection.delete({ where: { id } });
    invalidateDashboardCache(payload.userId);

    return successResponse({ deleted: true });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/connections/[id]', method: 'DELETE' });
  }
}
