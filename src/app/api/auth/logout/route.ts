import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, deleteSession, clearSessionCookies } from '@/services/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  if (token) {
    const payload = verifyJwt(token);
    if (payload?.sessionId) {
      await deleteSession(payload.sessionId);
    }
  }

  const response = NextResponse.redirect(new URL('/login', req.url));
  const cookiesToClear = clearSessionCookies();
  for (const cookie of cookiesToClear) {
    response.cookies.set(cookie);
  }
  return response;
}
