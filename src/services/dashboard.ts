import db from '@/lib/db';

// ─── In-Memory TTL Cache ────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number = 30000): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─── Dashboard Data ─────────────────────────────────────────────────────────

export interface DashboardData {
  connections: Array<{
    id: string;
    toolName: string;
    status: string;
    expiresAt: Date | null;
  }>;
  apiKeys: Array<{
    id: string;
    toolName: string;
    status: string;
  }>;
  recentLogs: Array<{
    id: string;
    toolName: string;
    actionType: string;
    responseStatus: number | null;
    errorMessage: string | null;
    createdAt: Date;
  }>;
  expiringTokens: Array<{
    id: string;
    toolName: string;
    expiresAt: Date | null;
  }>;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const cacheKey = `dashboard:${userId}`;
  const cached = getCached<DashboardData>(cacheKey);
  if (cached) return cached;

  const start = performance.now();
  const [connections, apiKeys, recentLogs] = await Promise.all([
    db.toolConnection.findMany({
      where: { userId },
      select: { id: true, toolName: true, status: true, expiresAt: true },
    }),
    db.apiKeyConnection.findMany({
      where: { userId },
      select: { id: true, toolName: true, status: true },
    }),
    db.routingLog.findMany({
      where: { userId },
      select: { id: true, toolName: true, actionType: true, responseStatus: true, errorMessage: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const expiringTokens = connections.filter(
    (c) => c.expiresAt && c.expiresAt < new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  const duration = performance.now() - start;
  console.log(`[PERF] /dashboard data load for user ${userId}: ${duration.toFixed(2)}ms`);

  const data: DashboardData = { connections, apiKeys, recentLogs, expiringTokens };
  setCache(cacheKey, data, 30000); // 30s TTL
  return data;
}

// Invalidate cache when user performs an action
export function invalidateDashboardCache(userId: string): void {
  cache.delete(`dashboard:${userId}`);
}
