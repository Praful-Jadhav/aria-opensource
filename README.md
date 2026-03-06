<div align="center">

# ARIA Core

**Open-source tool connection and API routing platform.**

Connect your tools. Route your APIs. Own your data.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Prisma 7](https://img.shields.io/badge/Prisma-7-2D3748)](https://prisma.io)

[Documentation](docs/) · [Managed Platform →](https://github.com/PrafulJadhav/aria-business)

</div>

---

## What is ARIA Core?

ARIA Core is an open-source platform that acts as a secure central hub for all your external tool connections.

- **Connect** tools (GitHub, Google Workspace, REST APIs) in one place
- **Route** API calls through an encrypted proxy
- **Log** every request for audit and debugging
- **Protect** credentials with AES-256-GCM vault encryption

## Quick Start

**Requirements:** Node.js 18+, PostgreSQL (or use SQLite for local dev)

```bash
git clone https://github.com/PrafulJadhav/aria-core
cd aria-core
cp .env.template .env.local
# Fill in JWT_SECRET, ENCRYPTION_KEY, DATABASE_URL
npm install
npx prisma db push
npm run dev
```

Open http://localhost:3000

## Features (Self-hosted)

| Feature                           | Included        |
| --------------------------------- | --------------- |
| Email OTP authentication          | ✅              |
| AES-256-GCM credential encryption | ✅              |
| API proxy routing                 | ✅              |
| GitHub + Google OAuth             | ✅              |
| API key vault                     | ✅              |
| Activity logs                     | ✅ (last 100)   |
| Tool connections                  | ✅ (up to 3)    |
| Multi-user / teams                | ❌ Managed only |
| Vault management UI               | ❌ Managed only |
| Unlimited tools                   | ❌ Managed only |

## Tech Stack

Next.js 15 · TypeScript · Prisma · Tailwind CSS · jose · Zod

## License

MIT — © 2026 Praful Jadhav
