import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { generateOtp, hashOtp, upsertUser } from '@/services/auth';
import { checkOtpRateLimit } from '@/services/ratelimit';
import { safeErrorResponse, validationErrorResponse, successResponse } from '@/utils/error-handler';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse('VALIDATION', parsed.error.issues[0].message);
    }

    const { email } = parsed.data;

    // Rate limit
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rl = checkOtpRateLimit(email, ip);
    if (!rl.allowed) {
      return validationErrorResponse(
        'RATE_LIMITED',
        `Too many attempts. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`,
        429
      );
    }

    // Invalidate old OTPs
    await db.otpRequest.updateMany({
      where: { identifier: email, used: false },
      data: { used: true },
    });

    // Generate and store OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await db.otpRequest.create({
      data: {
        identifier: email,
        type: 'email',
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
    });

    // Console fallback — in production, send via email service
    console.log(`[OTP] Email OTP for ${email}: ${otp}`);

    return successResponse({ sent: true, remaining: rl.remaining });
  } catch (err) {
    return safeErrorResponse(err, { route: '/api/auth/email-otp/send', method: 'POST' });
  }
}
