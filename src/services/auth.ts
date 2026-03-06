import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { config } from '@/config';

const ACCESS_TOKEN_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── OTP ────────────────────────────────────────────────────────────────────

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

// ─── JWT ACCESS TOKEN ───────────────────────────────────────────────────────

export async function createAccessToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .sign(config.jwtSecret);
}

export async function verifyJwtToken(token: string): Promise<{ userId: string; sessionId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, config.jwtSecret);
    return payload as unknown as { userId: string; sessionId: string };
  } catch {
    return null;
  }
}

// Sync decode for server components
export function verifyJwt(token: string): { userId: string; sessionId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (!payload.userId || !payload.sessionId) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return { userId: payload.userId, sessionId: payload.sessionId };
  } catch {
    return null;
  }
}

// ─── SESSION MANAGEMENT (REFRESH TOKENS) ────────────────────────────────────

export async function createSession(
  userId: string,
  request?: { headers?: { get?: (name: string) => string | null } }
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION_MS);
  
  // Generate secure opaque refresh token
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const deviceInfo = request?.headers?.get?.('user-agent') || 'unknown';
  const ipAddress = request?.headers?.get?.('x-forwarded-for') ||
    request?.headers?.get?.('x-real-ip') || 'unknown';

  const session = await db.authSession.create({
    data: {
      userId,
      tokenHash,
      deviceInfo,
      ipAddress,
      expiresAt,
    },
  });

  const accessToken = await createAccessToken(userId, session.id);
  
  return { accessToken, refreshToken, expiresAt };
}

export async function rotateSession(
  sessionId: string,
  oldRefreshToken: string,
  request?: { headers?: { get?: (name: string) => string | null } }
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> {
  const session = await db.authSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  // Verify old refresh token
  const oldHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
  if (session.tokenHash !== oldHash) {
    // SECURITY: Token reuse detected! Invalidate all user sessions to prevent hijacked access.
    await deleteAllUserSessions(session.userId);
    console.warn(`[SECURITY] Refresh token reuse detected for user ${session.userId}. All sessions revoked.`);
    return null;
  }

  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId);
    return null;
  }

  // Generate new tokens
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION_MS);
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const deviceInfo = request?.headers?.get?.('user-agent') || session.deviceInfo;
  const ipAddress = request?.headers?.get?.('x-forwarded-for') ||
    request?.headers?.get?.('x-real-ip') || session.ipAddress;

  await db.authSession.update({
    where: { id: sessionId },
    data: {
      tokenHash,
      expiresAt,
      deviceInfo,
      ipAddress
    },
  });

  const accessToken = await createAccessToken(session.userId, session.id);
  
  return { accessToken, refreshToken, expiresAt };
}

export async function validateSession(token: string): Promise<string | null> {
  const payload = await verifyJwtToken(token);
  if (!payload) return null;

  const session = await db.authSession.findFirst({
    where: {
      id: payload.sessionId,
      userId: payload.userId,
      expiresAt: { gt: new Date() },
    },
  });

  return session ? payload.userId : null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.authSession.delete({ where: { id: sessionId } }).catch(() => {});
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.authSession.deleteMany({ where: { userId } });
}

// ─── USER UPSERT ────────────────────────────────────────────────────────────

export async function upsertUser(data: {
  email?: string;
  phone?: string;
  name?: string;
  avatarUrl?: string;
}): Promise<string> {
  const identifier = data.email || data.phone;
  if (!identifier) throw new Error('Email or phone required');

  const where = data.email
    ? { email: data.email }
    : { phone: data.phone! };

  let user = await db.user.findFirst({ where });

  if (user) {
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });
    return user.id;
  }

  user = await db.user.create({
    data: {
      email: data.email || `${crypto.randomUUID()}@placeholder.local`,
      phone: data.phone,
      name: data.name,
      avatarUrl: data.avatarUrl,
    },
  });

  return user.id;
}

// ─── COOKIE HELPERS ─────────────────────────────────────────────────────────

export function sessionCookieOptions(expiresAt: Date, isRefresh = false) {
  return {
    name: isRefresh ? 'refresh_token' : 'access_token',
    value: '', // set by caller
    httpOnly: true,
    secure: true, // Always true for production rigor
    sameSite: 'strict' as const,
    path: '/',
    expires: expiresAt,
  };
}

export function clearSessionCookies() {
  return [
    {
      name: 'access_token',
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
    },
    {
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
    }
  ];
}

// ─── VERIFY SESSION FROM REQUEST ────────────────────────────────────────────
// Standard auth helper for API routes: extracts access_token cookie, verifies JWT,
// confirms session exists in DB. Returns { userId, sessionId } or null.

export async function verifySession(
  req: NextRequest
): Promise<{ userId: string; sessionId: string } | null> {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return null;

  const payload = await verifyJwtToken(token);
  if (!payload) return null;

  const session = await db.authSession.findFirst({
    where: {
      id: payload.sessionId,
      userId: payload.userId,
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) return null;
  return { userId: payload.userId, sessionId: payload.sessionId };
}
