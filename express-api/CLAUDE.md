# CLAUDE.md

This file is loaded automatically by Claude Code at the start of every conversation.
For the full AI guide see [docs/ai-guide.md](docs/ai-guide.md).

## Project

Modular Express + TypeScript REST API. No ORM — raw `pg` queries. Zod for validation. OpenAPI docs auto-generated from Zod schemas via `@asteasolutions/zod-to-openapi`.

## Non-negotiable rules

- **Always import `z` from `../../../shared/lib/zod`**, never directly from `'zod'` — breaks OpenAPI generation
- **Errors:** throw `AppError(message, statusCode)` from `shared/middleware/error.middleware`
- **Responses:** always `{ status: 'success', data }` or `res.status(204).send()`
- **Validation:** use the `validate(ZodSchema)` middleware factory, never validate manually in controllers
- **Auth:** use `authMiddleware` from `shared/middleware/auth.middleware` to protect routes
- **SQL:** parameterized queries only (`$1`, `$2`…), never string interpolation

## Module structure

Every feature follows this exact layout:

```
src/modules/<feature>/
  dtos/               ← Zod schemas + inferred types
  repositories/       ← SQL queries only, no business logic
  services/           ← business logic, throws AppError
  controllers/        ← req/res handling, delegates to service
  <feature>.routes.ts
  <feature>.swagger.ts
```

## Registering a new module

1. Add routes in `src/app.ts`: `app.use('/api/<feature>', featureRoutes)`
2. Add swagger side-effect import in `src/shared/swagger/swagger.config.ts`
3. Add tables to `docker/postgres/init.sql`

## Database

- Pool: `import { pool } from 'src/shared/database/connection'`
- Schema: `docker/postgres/init.sql` — runs once on first container start
- Reset DB volume after schema changes: `docker compose down -v && docker compose up`
