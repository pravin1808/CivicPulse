# CivicPulse Frontend

Vite + React + TypeScript frontend for CivicPulse. This app is additive and independent from the existing Spring Boot backend.

## Features

- React Router based navigation
- Role-based experience for:
  - `ADMIN`
  - `WORKER`
  - `CITIZEN` (user)
- Dashboards:
  - Default dashboard (overview cards + recent issues)
  - Admin dashboard (issues + workers + issue allocation/reallocation)
  - Worker dashboard (assigned issues)
  - User dashboard (submitted issues and statuses)
- Route guards per role
- Typed models/interfaces:
  - `Issue`, `Worker`, `User`, `Allocation`
- Centralized API services and endpoint placeholders
- Local mock mode so the UI runs before backend wiring
- Loading, empty, and error states on key pages

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build and lint

```bash
npm run lint
npm run build
```

## Backend integration

Configure environment variables in `frontend/.env` (optional):

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_API=false
```

When `VITE_USE_MOCK_API` is omitted (or not `false`), the app uses local mock data from `src/api/mockData.ts`.

### Current endpoint placeholders

- `GET /api/admin/issues/all`
- `GET /api/admin/workers`
- `PATCH /api/admin/issue/assign/{issueId}`
- `GET /api/citizen/issue/all?citizenId={id}`
- `GET /api/worker/issues/assigned?workerId={id}`

All endpoint paths are centralized in `src/api/endpoints.ts` for easy updates.
