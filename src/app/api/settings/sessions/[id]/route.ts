import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/services/auth';
import { safeErrorResponse, unauthorizedResponse, validationErrorResponse } from '@/utils/error-handler';
import db from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await verifySession(req);
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const targetSession = await db.authSession.findUnique({
      where: { id }
    });

    if (!targetSession || targetSession.userId !== session.userId) {
      return validationErrorResponse('NOT_FOUND', 'Session not found', 404);
    }

    await db.authSession.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/settings/sessions/[id]', method: 'DELETE' });
  }
}
