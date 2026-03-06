/**
 * ARIA Vault Service
 * Central service for all credential lifecycle operations.
 *
 * SECURITY INVARIANTS:
 * 1. No plaintext credential is ever returned from any public method except unsealForUse()
 * 2. unsealForUse() result must be used immediately and discarded
 * 3. Every vault operation is audit-logged with userId + action + timestamp
 * 4. Vault entries are soft-deleted — never hard-deleted (audit trail)
 */

import db from '@/lib/db';
import { sealSecret, unsealSecret, type SealedSecret } from '@/lib/vault';
import { logger } from './logger';

type CreateVaultEntryInput = {
  userId: string;
  label: string;
  type: 'api_key' | 'oauth_token' | 'refresh_token' | 'webhook_secret';
  plaintext: string;
  metadata?: Record<string, string>;
  expiresAt?: Date;
};

export const vaultService = {
  /**
   * Store a new credential in the vault.
   * Returns the vault entry ID — NOT the credential.
   */
  async seal(input: CreateVaultEntryInput): Promise<{ id: string; label: string }> {
    const sealed = sealSecret(input.plaintext, { hint: true });

    const entry = await db.vaultEntry.create({
      data: {
        userId: input.userId,
        label: input.label,
        type: input.type,
        ciphertext: sealed.ciphertext,
        iv: sealed.iv,
        authTag: sealed.authTag,
        version: sealed.version,
        sealedAt: sealed.sealedAt,
        hint: sealed.hint,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        expiresAt: input.expiresAt ?? null,
      },
    });

    await logger.auditLog({
      userId: input.userId,
      action: 'vault.seal',
      resource: entry.id,
      detail: `Sealed credential: ${input.label} (type: ${input.type})`,
    });

    return { id: entry.id, label: entry.label };
  },

  /**
   * Retrieve a credential for immediate use — NEVER cache the result.
   * The returned string must be used in the current request scope only.
   */
  async unsealForUse(vaultEntryId: string, userId: string): Promise<string> {
    const entry = await db.vaultEntry.findUnique({
      where: { id: vaultEntryId, userId, isRevoked: false },
    });

    if (!entry) throw new Error('Vault entry not found or access denied');
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      throw new Error('Vault credential has expired');
    }

    // Update last used timestamp
    await db.vaultEntry.update({
      where: { id: vaultEntryId },
      data: { lastUsedAt: new Date() },
    });

    await logger.auditLog({
      userId,
      action: 'vault.unseal',
      resource: vaultEntryId,
      detail: `Credential accessed for use: ${entry.label}`,
    });

    const sealed: SealedSecret = {
      ciphertext: entry.ciphertext,
      iv: entry.iv,
      authTag: entry.authTag,
      version: entry.version,
      sealedAt: entry.sealedAt,
    };

    return unsealSecret(sealed);
  },

  /**
   * List vault entries for a user — metadata only, NO ciphertext.
   */
  async listForUser(userId: string) {
    const entries = await db.vaultEntry.findMany({
      where: { userId, isRevoked: false },
      orderBy: { createdAt: 'desc' },
    });

    // IMPORTANT: Strip ciphertext before returning
    return entries.map((e) => ({
      id: e.id,
      label: e.label,
      type: e.type,
      hint: e.hint,
      sealedAt: e.sealedAt,
      lastUsedAt: e.lastUsedAt,
      expiresAt: e.expiresAt,
      metadata: e.metadata ? JSON.parse(e.metadata as string) : {},
    }));
  },

  /**
   * Revoke a vault entry — soft delete with audit log.
   */
  async revoke(vaultEntryId: string, userId: string): Promise<void> {
    const entry = await db.vaultEntry.findUnique({
      where: { id: vaultEntryId, userId },
    });
    if (!entry) throw new Error('Entry not found');

    await db.vaultEntry.update({
      where: { id: vaultEntryId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    await logger.auditLog({
      userId,
      action: 'vault.revoke',
      resource: vaultEntryId,
      detail: `Credential revoked: ${entry.label}`,
    });
  },

  /**
   * Rotate the vault encryption key for a user's entries.
   * Decrypts with current key, re-encrypts with current key (new IV).
   * For actual key rotation, the ENCRYPTION_KEY env var must change.
   */
  async rotateEncryption(userId: string): Promise<{ rotated: number }> {
    const entries = await db.vaultEntry.findMany({
      where: { userId, isRevoked: false },
    });

    let rotated = 0;
    for (const entry of entries) {
      const sealed: SealedSecret = {
        ciphertext: entry.ciphertext,
        iv: entry.iv,
        authTag: entry.authTag,
        version: entry.version,
        sealedAt: entry.sealedAt,
      };
      const plaintext = unsealSecret(sealed);
      const resealed = sealSecret(plaintext, { hint: true });

      await db.vaultEntry.update({
        where: { id: entry.id },
        data: {
          ciphertext: resealed.ciphertext,
          iv: resealed.iv,
          authTag: resealed.authTag,
          version: resealed.version,
          sealedAt: resealed.sealedAt,
          hint: resealed.hint,
        },
      });
      rotated++;
    }

    await logger.auditLog({
      userId,
      action: 'vault.rotate',
      resource: 'all',
      detail: `Key rotation completed: ${rotated} entries re-encrypted`,
    });

    return { rotated };
  },
};
