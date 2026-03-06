import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { generateOtp, hashOtp } from '@/services/auth';
import { checkOtpRateLimit } from '@/services/ratelimit';
import { safeErrorResponse, validationErrorResponse, successResponse } from '@/utils/error-handler';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().min(10).max(15),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse('VALIDATION', parsed.error.issues[0].message);
    }

    const { phone } = parsed.data;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = checkOtpRateLimit(phone, ip);
    if (!rl.allowed) {
      return validationErrorResponse(
        'RATE_LIMITED',
        `Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`,
        429
      );
    }

    await db.otpRequest.updateMany({
      where: { identifier: phone, used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await db.otpRequest.create({
      data: {
        identifier: phone,
        type: 'phone',
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Console fallback — in production, send via SMS service
    console.log(`[OTP] Phone OTP for ${phone}: ${otp}`);

    return successResponse({ sent: true, remaining: rl.remaining });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/auth/phone-otp/send', method: 'POST' });
  }
}
