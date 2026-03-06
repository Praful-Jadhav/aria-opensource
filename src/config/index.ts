// ─── Environment Validation ─────────────────────────────────────────────────
// Validates required env vars on boot. Import in layout.tsx / middleware.

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

const OPTIONAL_VARS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
] as const;

let validated = false;

export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[CONFIG] Missing required environment variables:\n  ${missing.join('\n  ')}`
    );
  }

  // Validate JWT_SECRET length
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error('[CONFIG] JWT_SECRET must be at least 32 characters');
  }

  // Validate ENCRYPTION_KEY length (64 hex chars = 32 bytes)
  const encryptionKey = process.env.ENCRYPTION_KEY!;
  if (encryptionKey.length < 64) {
    throw new Error('[CONFIG] ENCRYPTION_KEY must be a 32-byte hex string (64 chars)');
  }

  // Warn about missing optional vars
  for (const key of OPTIONAL_VARS) {
    if (!process.env[key]) {
      console.warn(`[CONFIG] Optional env var ${key} not set — feature may be disabled`);
    }
  }

  validated = true;
}

export const config = {
  get appUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL!;
  },
  get jwtSecret(): Uint8Array {
    return new TextEncoder().encode(process.env.JWT_SECRET!);
  },
  get encryptionKey(): string {
    return process.env.ENCRYPTION_KEY!;
  },
  get googleClientId(): string | undefined {
    return process.env.GOOGLE_CLIENT_ID;
  },
  get googleClientSecret(): string | undefined {
    return process.env.GOOGLE_CLIENT_SECRET;
  },
  get githubClientId(): string | undefined {
    return process.env.GITHUB_CLIENT_ID;
  },
  get githubClientSecret(): string | undefined {
    return process.env.GITHUB_CLIENT_SECRET;
  },
  oauth: {
    get googleConfigured(): boolean {
      return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    },
    get githubConfigured(): boolean {
      return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
    },
  },
} as const;
