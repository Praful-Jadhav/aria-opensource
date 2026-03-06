import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/services/auth';
import { vaultService } from '@/services/vault.service';

/**
 * GET /api/vault — List vault entries for the authenticated user.
 * Returns metadata only — never ciphertext.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const entries = await vaultService.listForUser(payload.userId);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('[API /vault] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
