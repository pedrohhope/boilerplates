# AI Developer Guide

This document helps AI assistants (and developers working alongside them) understand the project structure, conventions, and patterns used in this codebase. Reference this before making changes.

---

## Project Overview

Modular Express + TypeScript REST API boilerplate with JWT authentication and PostgreSQL. No ORM — raw `pg` queries. Validation via Zod. OpenAPI docs auto-generated from Zod schemas.

---

## Architecture

Every feature lives in `src/modules/<feature>/` and follows the same layered structure:

```
routes.ts       → defines HTTP routes, applies middleware
controllers/    → handles request/response, delegates to service
services/       → business logic, throws AppError on failures
repositories/   → raw SQL queries via pg pool, no business logic here
dtos/           → Zod schemas for request validation + OpenAPI types
*.swagger.ts    → registers OpenAPI paths and schemas on the registry
```

Shared code lives in `src/shared/` and is never feature-specific:

```
database/       → pg connection pool (import { pool } from here)
lib/zod.ts      → zod extended with openapi (always import z from here, not from 'zod')
middleware/     → auth guard, validate factory, error handler
swagger/        → OpenAPI registry singleton and spec generator
types/          → shared TypeScript interfaces (AuthenticatedRequest, JwtPayload, etc.)
```

---

## Critical Conventions

### Always import `z` from the shared lib

```ts
// correct
import { z } from '../../../shared/lib/zod';

// wrong — breaks OpenAPI generation
import { z } from 'zod';
```

### Errors use AppError

```ts
import { AppError } from '../../../shared/middleware/error.middleware';

throw new AppError('Message here', 404); // statusCode defaults to 500
```

Unhandled errors fall through to `errorMiddleware` in `app.ts` and return `{ status: 'error', message }`.

### All responses follow the same envelope

```ts
// success with data
res.json({ status: 'success', data: result });

// success with no body
res.status(204).send();

// errors are handled by errorMiddleware automatically
```

### Validation middleware

Use the `validate` factory with a Zod schema — it parses `req.body` and replaces it with the typed result:

```ts
import { validate } from '../../shared/middleware/validate.middleware';
import { MyDtoSchema } from './dtos/my.dto';

router.post('/', validate(MyDtoSchema), controller.create);
```

### Protected routes use authMiddleware

```ts
import { authMiddleware } from '../../shared/middleware/auth.middleware';

router.use(authMiddleware); // apply to all routes in the file
// or per-route:
router.get('/:id', authMiddleware, controller.findById);
```

Authenticated controllers receive `AuthenticatedRequest` (has `req.user.id` and `req.user.email`).

---

## Adding a New Module

1. Create `src/modules/<feature>/` with this structure:
   ```
   dtos/
     create-<feature>.dto.ts
     update-<feature>.dto.ts
   repositories/<feature>.repository.ts
   services/<feature>.service.ts
   controllers/<feature>.controller.ts
   <feature>.routes.ts
   <feature>.swagger.ts
   ```

2. Register the route in `src/app.ts`:
   ```ts
   import featureRoutes from './modules/<feature>/<feature>.routes';
   app.use('/api/<feature>', featureRoutes);
   ```

3. Register the swagger file in `src/shared/swagger/swagger.config.ts` (side-effect import):
   ```ts
   import '../../modules/<feature>/<feature>.swagger';
   ```

4. Add any new tables to `docker/postgres/init.sql`.

---

## Database

- Connection pool: `src/shared/database/connection.ts` — import `pool` and call `pool.query()`
- Schema init: `docker/postgres/init.sql` — runs once on first container start
- UUIDs: use `uuid_generate_v4()` (the `uuid-ossp` extension is already loaded)
- Never use an ORM — write plain parameterized SQL (`$1`, `$2`, ...)

Example repository pattern:

```ts
import { pool } from '../../../shared/database/connection';

export class FeatureRepository {
  async findById(id: string): Promise<Row | null> {
    const result = await pool.query<Row>('SELECT * FROM table WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
}
```

---

## OpenAPI / Swagger

- Registry singleton: `src/shared/swagger/swagger.registry.ts`
- Each module's `*.swagger.ts` registers its own schemas and paths
- `swagger.config.ts` imports all swagger files for side effects, then generates the spec
- Docs available at runtime: `GET /api-docs` (UI) and `GET /api-docs.json` (raw spec)

DTO schema registration pattern:

```ts
import { z } from '../../shared/lib/zod';
import { registry } from '../../shared/swagger/swagger.registry';

const MySchema = z.object({ ... });
const MySchemaRef = registry.register('MySchema', MySchema);

registry.registerPath({
  method: 'get',
  path: '/api/feature',
  tags: ['Feature'],
  security: [{ bearerAuth: [] }],
  responses: { 200: { ... } },
});
```

---

## Environment Variables

All env vars are read from `.env` (copy from `.env.example`). Required vars:

| Variable                 | Used in                        |
| ------------------------ | ------------------------------ |
| `PORT`                   | `server.ts`                    |
| `DB_*`                   | `shared/database/connection.ts`|
| `JWT_SECRET`             | `auth.service.ts`, `auth.middleware.ts` |
| `JWT_EXPIRES_IN`         | `auth.service.ts`              |
| `JWT_REFRESH_SECRET`     | `auth.service.ts`              |
| `JWT_REFRESH_EXPIRES_IN` | `auth.service.ts`              |

---

## Running the Project

```bash
# Docker (recommended — starts app + postgres)
docker compose up

# Local
npm install
npm run dev
```

After schema changes to `init.sql`, recreate the database volume:

```bash
docker compose down -v
docker compose up
```
