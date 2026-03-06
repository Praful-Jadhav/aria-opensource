# Security Policy

## Supported Versions

| Version      | Supported |
| ------------ | --------- |
| 1.x (latest) | ✅        |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: security@aria.dev

We will respond within 48 hours.

**What to include:**

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

We follow responsible disclosure — we will credit you in the changelog.

## Security Architecture

- Credentials encrypted with AES-256-GCM
- JWT tokens with 15-minute expiry
- All tokens stored as hashes (never raw) in the database
- httpOnly, sameSite cookies
- CSRF protection on all state-mutating requests
- Input validation (Zod) on all API routes
- No raw SQL — parameterized queries via Prisma only
