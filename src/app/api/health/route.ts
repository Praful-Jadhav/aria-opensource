import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyEncryptionService } from '@/services/encryption.service';

export async function GET() {
  const checks: Record<string, string> = {};
  let overall = 'ok';

  // Database
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch {
    checks.database = 'disconnected';
    overall = 'error';
  }

  // Encryption service
  try {
    const encOk = verifyEncryptionService();
    checks.encryption = encOk ? 'operational' : 'failed';
    if (!encOk) overall = 'degraded';
  } catch {
    checks.encryption = 'failed';
    overall = 'degraded';
  }

  // JWT Readiness
  try {
    const { config } = await import('@/config');
    const jwtConfigured = config.jwtSecret && config.jwtSecret.length >= 32;
    checks.jwt = jwtConfigured ? 'ready' : 'invalid';
    if (!jwtConfigured) overall = 'error';
  } catch {
    checks.jwt = 'failed';
    overall = 'error';
  }

  // Routing readiness
  checks.routing = checks.database === 'connected' && checks.encryption !== 'failed' && checks.jwt === 'ready'
    ? 'ready'
    : 'not_ready';

  const status = overall === 'ok' ? 200 : 503;

  return NextResponse.json({
    status: overall,
    checks,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }, { status });
}

