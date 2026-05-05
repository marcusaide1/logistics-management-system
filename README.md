## Logistics Company Web App (MVP)

Monorepo with:

- `frontend/`: React (Vite) + Tailwind UI
- `backend/`: Node.js (Express) + Prisma ORM
- `nginx/`: Reverse proxy config
- `terraform/`: Starter IaC scaffold
- `docker-compose.yml`: Local multi-service dev

### Features included

- Public website: Home / About / Services / Contact
- Header: logo + nav + client auth + admin login
- Tracking: enter tracking number and see status timeline
- Client dashboard: sidebar + “My shipments” + payments
- Admin dashboard: create shipments, update status, view users, mark payments
- Notifications: toast alerts for key actions
- Database: SQL via Prisma (PostgreSQL with Docker; SQLite for local development)

### Prerequisites

- Install Node.js LTS (includes `npm`)
- Docker Desktop (optional, but recommended for running Postgres + nginx)

### Quick start (local, SQLite)

From repo root:

```bash
cd backend
npm install
npm run db:push
npm run seed
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The `frontend/` app is a Vite + React + Tailwind SPA. In development it proxies API calls from `/api/*` to `http://localhost:8080/*` (see `frontend/vite.config.js` and `frontend/.env.development`).

Open the frontend URL shown by Vite (usually `http://localhost:5173`).

### Default accounts (seeded)

- Admin: `admin@logi.local` / ``
- Client: `client@logi.local` / `Client123!`

### Run with Docker (PostgreSQL + nginx)

```bash
docker compose up --build
```

Then open `http://localhost`. PostgreSQL runs automatically as part of the stack.

**Note:** Uses PostgreSQL 16 with credentials in `docker-compose.yml` (change `POSTGRES_PASSWORD` in production!).

### Notes

- Email sending is stubbed (contact form stores messages in DB).
- Payment portal is a starter “checkout record” flow (no real card processing yet).
- To wire real payments later, add Stripe and replace the `/payments/checkout` stub.

