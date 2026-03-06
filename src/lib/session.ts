import { NextRequest } from 'next/server';
import { validateSession } from '@/services/auth';

/**
 * Extract authenticated userId from session cookie.
 * Returns null if unauthenticated.
 */
export async function getSessionUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return null;
  return validateSession(token);
}
