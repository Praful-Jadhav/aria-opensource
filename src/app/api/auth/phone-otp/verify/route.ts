import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyOtp, createSession, upsertUser, sessionCookieOptions } from '@/services/auth';
import { checkLoginRateLimit } from '@/services/ratelimit';
import { safeErrorResponse, validationErrorResponse } from '@/utils/error-handler';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse('VALIDATION', parsed.error.issues[0].message);
    }

    const { phone, otp } = parsed.data;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = checkLoginRateLimit(phone, ip);
    if (!rl.allowed) {
      return validationErrorResponse('RATE_LIMITED', 'Too many attempts. Please wait.', 429);
    }

    const otpRecord = await db.otpRequest.findFirst({
      where: {
        identifier: phone,
        type: 'phone',
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

    const userId = await upsertUser({ phone });
    const { accessToken, refreshToken, expiresAt } = await createSession(userId, req);

    const response = NextResponse.json(
      { success: true, data: { userId } },
      { status: 200 }
    );

    response.cookies.set({
      ...sessionCookieOptions(new Date(Date.now() + 15 * 60 * 1000), false),
      value: accessToken,
    });
    response.cookies.set({
      ...sessionCookieOptions(expiresAt, true),
      value: refreshToken,
    });

    return response;
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/auth/phone-otp/verify', method: 'POST' });
  }
}
