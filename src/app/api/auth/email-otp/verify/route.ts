import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyOtp, createSession, upsertUser, sessionCookieOptions } from '@/services/auth';
import { checkLoginRateLimit } from '@/services/ratelimit';
import { safeErrorResponse, validationErrorResponse } from '@/utils/error-handler';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse('VALIDATION', parsed.error.issues[0].message);
    }

    const { email, otp } = parsed.data;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = checkLoginRateLimit(email, ip);
    if (!rl.allowed) {
      return validationErrorResponse('RATE_LIMITED', 'Too many attempts. Please wait.', 429);
    }

    const otpRecord = await db.otpRequest.findFirst({
      where: {
        identifier: email,
        type: 'email',
        used: false,
        expiresAt: { gt: new Date() },
        attempts: { lt: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return validationErrorResponse('INVALID_OTP', 'OTP expired or not found', 401);
    }

    await db.otpRequest.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    const valid = await verifyOtp(otp, otpRecord.otpHash);
    if (!valid) {
      return validationErrorResponse('INVALID_OTP', 'Invalid OTP', 401);
    }

    await db.otpRequest.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const userId = await upsertUser({ email });
    const { accessToken, refreshToken, expiresAt } = await createSession(userId, req);

    const response = NextResponse.json(
      { success: true, data: { userId } },
      { status: 200 }
    );

    // Access token cookie (short lived, e.g. 15m)
    response.cookies.set({
      ...sessionCookieOptions(new Date(Date.now() + 15 * 60 * 1000), false),
      value: accessToken,
    });
    // Refresh token cookie (long lived, e.g. 7d)
    response.cookies.set({
      ...sessionCookieOptions(expiresAt, true),
      value: refreshToken,
    });

    return response;
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/auth/email-otp/verify', method: 'POST' });
  }
}
