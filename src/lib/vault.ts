/**
 * ARIA Vault Library
 * Provides secure seal/unseal operations for all sensitive credentials.
 * Raw credentials NEVER leave vault in plaintext via API responses.
 *
 * Sealed format uses AES-256-GCM via encryption.service.ts
 */

import { encrypt, decrypt, type EncryptedData } from '@/services/encryption.service';

export interface SealedSecret {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
  sealedAt: string;
  hint?: string; // Last 4 chars of original value for UI display only
}

export interface VaultEntry {
  id: string;
  userId: string;
  label: string;
  type: 'api_key' | 'oauth_token' | 'refresh_token' | 'webhook_secret';
  sealed: SealedSecret;
  lastUsedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, string>;
}

/**
 * Seal a plaintext secret into vault format.
 * Returns SealedSecret — the original value is irrecoverable without ENCRYPTION_KEY.
 */
export function sealSecret(
  plaintext: string,
  options?: { hint?: boolean }
): SealedSecret {
  const encrypted: EncryptedData = encrypt(plaintext);
  return {
    ciphertext: encrypted.encrypted,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    version: 1,
    sealedAt: new Date().toISOString(),
    hint: options?.hint ? `...${plaintext.slice(-4)}` : undefined,
  };
}

/**
 * Unseal a vault secret — returns plaintext.
 * RULE: The returned value must NEVER be:
 *   - Logged to console
 *   - Returned in any API response
 *   - Stored in any variable beyond immediate use
 */
export function unsealSecret(sealed: SealedSecret): string {
  const data: EncryptedData = {
    encrypted: sealed.ciphertext,
    iv: sealed.iv,
    authTag: sealed.authTag,
  };
  return decrypt(data);
}

/**
 * Create a safe display version of a sealed secret.
 * For UI: shows type + hint only, never ciphertext.
 */
export function vaultDisplayMeta(entry: VaultEntry): {
  id: string;
  label: string;
  type: string;
  hint?: string;
  sealedAt: string;
  lastUsedAt?: Date;
  expiresAt?: Date;
} {
  return {
    id: entry.id,
    label: entry.label,
    type: entry.type,
    hint: entry.sealed.hint,
    sealedAt: entry.sealed.sealedAt,
    lastUsedAt: entry.lastUsedAt,
    expiresAt: entry.expiresAt,
  };
}
