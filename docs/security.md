# ARIA Core — Security Documentation

## Encryption

All credentials are encrypted using **AES-256-GCM** before storage:

- Every encryption operation generates a unique random IV (16 bytes)
- Authentication tags are stored alongside ciphertext for integrity verification
- The encryption key is derived from the `ENCRYPTION_KEY` environment variable (32 bytes / 64 hex chars)
- Raw credentials never appear in logs, API responses, or error messages

## Authentication

### Session Flow

1. User authenticates via Email OTP, Phone OTP, or OAuth (GitHub/Google)
2. Server creates a JWT access token (15-minute expiry) and an opaque refresh token (7-day expiry)
3. Both tokens are set as `httpOnly`, `secure`, `sameSite: strict` cookies
4. Access tokens are verified on each request via middleware
5. When access tokens expire, the refresh token is used to rotate the session
6. Refresh token reuse is detected — all sessions are revoked on reuse attempt

### Token Security

- Access tokens: JWT, signed with `HS256`, 15-minute expiry
- Refresh tokens: Cryptographically random (32 bytes), stored as SHA-256 hash in DB
- No token is ever stored in plaintext in the database

## Rate Limiting

- All authentication endpoints are rate-limited
- In-memory rate limiter (Phase 1)
- Redis-backed rate limiter planned (Phase 2)

## Input Validation

- All API routes validate input using Zod schemas
- No raw SQL queries — all database access through Prisma ORM
- Request payloads are parsed and validated before any business logic

## Vault Security

- Credentials stored in the vault are encrypted at rest
- Unsealed credentials are used immediately and never cached
- Every vault operation (seal, unseal, revoke, rotate) is audit-logged
- Vault entries are soft-deleted (never hard-deleted) for audit trail

## Vulnerability Reporting

See [SECURITY.md](../SECURITY.md) for reporting instructions.
