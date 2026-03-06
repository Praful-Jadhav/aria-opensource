import db from '@/lib/db';

export async function logRoute(params: {
  userId: string;
  toolName: string;
  actionType: string;
  responseStatus?: number;
  durationMs?: number;
  errorMessage?: string;
}) {
  return db.routingLog.create({
    data: {
      userId: params.userId,
      toolName: params.toolName,
      actionType: params.actionType,
      responseStatus: params.responseStatus ?? null,
      durationMs: params.durationMs ?? null,
      errorMessage: params.errorMessage ?? null,
    },
  });
}

export async function getUserLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return db.routingLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getRecentLogs(userId: string, limit: number = 10) {
  return db.routingLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Audit log for security-sensitive operations (vault, auth, etc.)
 * Writes to both console (for observability) and DB (for audit trail).
 */
export const logger = {
  async auditLog(params: {
    userId: string;
    action: string;
    resource: string;
    detail: string;
  }) {
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] ${timestamp} | user:${params.userId} | ${params.action} | ${params.resource} | ${params.detail}`);

    try {
      await db.routingLog.create({
        data: {
          userId: params.userId,
          toolName: 'vault',
          actionType: params.action,
          errorMessage: params.detail,
        },
      });
    } catch (err) {
      console.error('[AUDIT] Failed to persist audit log:', err);
    }
  },
};

