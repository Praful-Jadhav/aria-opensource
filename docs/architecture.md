# ARIA Core — Architecture

## Overview

ARIA Core is built on Next.js 15 (App Router) with TypeScript, using a layered architecture that separates concerns cleanly.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  src/app/         — Pages and layouts (React Server     │
│  src/components/  — Reusable UI components              │
├─────────────────────────────────────────────────────────┤
│                    API LAYER                              │
│  src/app/api/     — Route handlers (REST endpoints)     │
│  src/middleware.ts — Auth + rate limiting middleware     │
├─────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                          │
│  src/services/    — Business logic (auth, vault, etc.)  │
│  src/lib/         — Core utilities (db, session, vault) │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                            │
│  prisma/          — Schema and migrations               │
│  SQLite (dev) / PostgreSQL (prod)                       │
└─────────────────────────────────────────────────────────┘
```

## Key Modules

### Authentication (`src/services/auth.ts`)
- Email OTP and Phone OTP flows
- GitHub and Google OAuth
- JWT access tokens (15min) + refresh tokens (7 days)
- Session rotation for security

### Vault (`src/lib/vault.ts` + `src/services/vault.service.ts`)
- AES-256-GCM encryption for all credentials
- Seal/unseal operations
- Audit logging for every credential access
- Key rotation support

### Proxy Engine (`src/app/api/proxy/route.ts`)
- Routes API calls through encrypted proxy
- Automatic retry with backoff
- Error categorization (auth, provider, client errors)
- Full request logging

### Encryption (`src/services/encryption.service.ts`)
- AES-256-GCM with random IV per operation
- Health check verification
- Single key management

## Database Models

- **User** — Account with email/phone, admin flag
- **AuthSession** — JWT sessions with device tracking
- **OtpRequest** — Time-limited OTP codes
- **ToolConnection** — OAuth connections (GitHub, Google)
- **OAuthToken** — Encrypted OAuth access/refresh tokens
- **ApiKeyConnection** — Encrypted API keys
- **RoutingLog** — Audit trail for all operations
- **VaultEntry** — Encrypted credential storage
- **SystemConfig** — Key-value system configuration
