import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/services/auth';
import { vaultService } from '@/services/vault.service';

/**
 * POST /api/vault/rotate — Rotate encryption on all vault entries for the user.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await vaultService.rotateEncryption(payload.userId);
    return NextResponse.json({
      success: true,
      message: `Key rotation complete. ${result.rotated} entries re-encrypted.`,
      rotated: result.rotated,
    });
  } catch (err) {
    console.error('[API /vault/rotate] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
