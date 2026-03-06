import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/services/auth';
import { vaultService } from '@/services/vault.service';

/**
 * DELETE /api/vault/[id] — Revoke a vault entry (soft-delete).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    await vaultService.revoke(id, payload.userId);
    return NextResponse.json({ success: true, message: 'Vault entry revoked' });
  } catch (err) {
    console.error('[API /vault/[id]] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
