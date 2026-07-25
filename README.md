# Oryntal Estate – Real Estate CRM

A full-stack SaaS Real Estate CRM built with a Turborepo monorepo architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Monorepo | Turborepo, npm Workspaces |

## Project Structure

```
oryntal-estate-crm/
├── apps/
│   └── web/                          # React frontend (Vite)
│       └── src/
│           ├── components/
│           │   ├── common/           # Shared UI (Button, Card, Modal, etc.)
│           │   ├── dashboard/        # User dashboard widgets
│           │   └── admin/            # Super-admin widgets
│           ├── pages/
│           │   ├── auth/             # Login, Register, Forgot Password
│           │   ├── dashboard/        # User dashboard pages
│           │   └── admin/            # Super-admin pages
│           ├── layouts/
│           │   ├── AuthLayout.tsx    # Public auth pages
│           │   ├── DashboardLayout.tsx  # User dashboard shell
│           │   └── AdminLayout.tsx   # Super-admin shell
│           ├── routes/               # Route config + guards
│           ├── hooks/                # Custom React hooks
│           ├── stores/               # Zustand state stores
│           ├── services/             # API client
│           └── types/                # Frontend types
│
├── packages/
│   ├── backend/                      # Express API server
│   │   └── src/
│   │       ├── config/               # App + Supabase config
│   │       ├── middleware/           # Auth, admin, validation, errors
│   │       ├── routes/               # API routes
│   │       │   ├── admin/            # Admin-only routes
│   │       ├── controllers/          # Request handlers
│   │       │   └── admin/            # Admin controllers
│   │       ├── services/             # Business logic
│   │       │   └── admin/            # Admin services
│   │       ├── validators/           # Zod schemas
│   │       ├── types/                # Backend types
│   │       └── utils/                # Logger, helpers
│   │
│   └── shared/                       # Shared types & constants
│       └── src/
│           ├── types/                # User, Lead, Property, Deal, etc.
│           └── constants/            # Enums, route paths
│
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/                   # 10 SQL migration files
│
├── docker/                           # Dockerfiles + compose
└── scripts/                          # Setup + seed scripts
```

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Apply database migrations
npm run db:migrate

# Start development servers
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in dev mode |
| `npm run dev:web` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Type-check all packages |
| `npm run db:migrate` | Push migrations to Supabase |
| `npm run db:reset` | Reset database and re-apply |
| `npm run db:seed` | Seed database with test data |

## User Roles

- **User** – Access to dashboard, leads, properties, clients, deals, calendar, reports
- **Super Admin** – All user features + admin dashboard, user management, subscriptions, audit logs, billing

## License

Private – Oryntal Estate
