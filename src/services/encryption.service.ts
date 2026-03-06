import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Fail fast on boot if key is missing or invalid length
const secret = process.env.ENCRYPTION_KEY;
if (!secret || secret.length < 64) {
  throw new Error('[SECURITY_CRITICAL] ENCRYPTION_KEY must be a 32-byte hex string (64 chars). System will not boot.');
}
const KEY = Buffer.from(secret, 'hex');

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encrypt(plaintext: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

export function decrypt(data: EncryptedData): string {
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(data.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    throw new Error('[SECURITY_CRITICAL] Decryption failed. Data may be tampered.');
  }
}

// Health check — verifies encryption round-trip
export function verifyEncryptionService(): boolean {
  try {
    const testData = 'encryption-health-check';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    return decrypted === testData;
  } catch {
    return false;
  }
}
