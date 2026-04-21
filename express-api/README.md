# express-api

A modular REST API boilerplate built with Express and TypeScript, backed by PostgreSQL and fully containerized with Docker.

## Features

- **Modular architecture** — code organized by feature modules (`auth`, `users`), each with its own routes, controllers, services, repositories, and DTOs
- **JWT authentication** — access + refresh token flow with bcrypt password hashing
- **PostgreSQL** — raw `pg` client with a shared connection pool (no ORM overhead)
- **Docker Compose** — one command spins up the app and database with a health-check gate
- **Input validation** — request validation via `express-validator`
- **Error handling** — centralized error middleware for consistent API responses
- **TypeScript strict mode** — full type safety across the entire codebase

## Tech Stack

- [Express](https://expressjs.com/) 4
- [TypeScript](https://www.typescriptlang.org/) 5
- [PostgreSQL](https://www.postgresql.org/) 16
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [express-validator](https://express-validator.github.io/)
- [Docker](https://www.docker.com/) + Docker Compose

## Project Structure

```
src/
├── modules/
│   ├── auth/              # Register, login, refresh token
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── dtos/
│   │   └── auth.routes.ts
│   └── users/             # CRUD for user management
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── dtos/
│       └── user.routes.ts
└── shared/
    ├── database/          # pg connection pool
    ├── middleware/        # auth guard, error handler
    └── types/
```

## Getting Started

**With Docker (recommended)**

```bash
cp .env.example .env
docker compose up
```

**Without Docker**

```bash
cp .env.example .env   # fill in your local DB credentials
npm install
npm run dev
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `express_api` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | — |
| `JWT_SECRET` | Secret for access tokens | — |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | — |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Login, get tokens |
| `POST` | `/api/auth/refresh` | — | Refresh access token |
| `GET` | `/api/users` | JWT | List users |
| `GET` | `/api/users/:id` | JWT | Get user by ID |
| `PUT` | `/api/users/:id` | JWT | Update user |
| `DELETE` | `/api/users/:id` | JWT | Delete user |

## Scripts

```bash
npm run dev      # Start dev server with hot reload (ts-node-dev)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled output
npm run lint     # Lint source files with ESLint
```
