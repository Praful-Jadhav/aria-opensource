# ARIA Core — Contributing Guide (Technical)

## Project Structure

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # Reusable UI components (layout + ui)
├── config/        # Environment validation and config
├── lib/           # Core utilities (db, session, vault)
├── services/      # Business logic services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── middleware.ts   # Auth and rate limiting middleware
```

## Development Workflow

1. `npm run dev` — Start development server
2. `npm run build` — Production build (must pass before PR)
3. `npm run lint` — ESLint check
4. `npx tsc --noEmit` — Type check
5. `npx prisma db push` — Sync schema to dev DB
6. `npx prisma studio` — Browse database

## Adding a New API Route

1. Create file at `src/app/api/[route]/route.ts`
2. Use the standard template (see `CONTRIBUTING.md`)
3. Add Zod validation for all inputs
4. Call services for business logic (no raw DB in routes)
5. Add audit logging for sensitive operations

## Adding a New Service

1. Create file at `src/services/[name].ts`
2. Follow single-responsibility principle
3. Use `db` from `@/lib/db` for database access
4. Export functions or a service object
5. Add audit logging via `logger.auditLog()` for security operations

## Database Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` to sync
3. Run `npx prisma generate` to update client
4. Test the build with `npm run build`
