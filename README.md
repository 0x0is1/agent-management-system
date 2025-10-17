## Agent Management System

A small full-stack app for creating agents and assigning tasks. This repository contains a Node/Express backend and a Next.js frontend (App Router).

## Contents
- `backend/` — Express API and utilities
- `frontend/` — Next.js app (App Router)

## Prerequisites
- Node.js 18.x (LTS) or newer
- npm (bundled with Node)
- MongoDB (local or hosted)
- Docker (optional, for containerized backend or MongoDB)

## Quick start (recommended order)

1) Start or make a MongoDB instance available.
   - Quick local Docker Mongo:

```cmd
docker run -d --name agent-mongo -p 27017:27017 mongo:6.0
```

2) Backend — install, configure, run

```cmd
cd agent-management-system\backend
npm install
```

Create an environment file used by the backend at `backend/src/env/.env`. Example contents:

```
PORT=3001
HOST=127.0.0.1          # or 0.0.0.0 for binding to all interfaces (useful in containers)
MONGO_URI=mongodb://localhost:27017/agentdb
JWT_SECRET=your_jwt_secret_here
```

Run the backend:

```cmd
npm start
```

Notes:
- The backend entrypoint is `backend/src/index.js`. It reads env from `backend/src/env/.env` (via dotenv).
- Available npm scripts (see `backend/package.json`):
  - `start` — runs `node src/index.js`
  - `generate` — runs `node src/utils/mockCSVGenerator.js` and writes `src/mockdata/mock_tasks.csv`

Generate sample mock CSV data (optional):

```cmd
npm run generate
```

3) Frontend — install, configure, run

```cmd
cd agent-management-system\frontend
npm install
```

Create a `.env.local` in the `frontend/` folder (Next.js) with the backend base URL. Example:

```
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Run the frontend in development:

```cmd
npm run dev
```

Open http://localhost:3000 in your browser.

## Docker (backend)

The backend includes a `Dockerfile` which installs production dependencies and runs `npm start`.

Build the image from the `backend/` folder:

```cmd
cd agent-management-system\backend
docker build -t agent-backend .
```

Run the container (example mapping container port to host). The app reads `PORT` from the environment — set it to match the mapped port.

```cmd
docker run -d --name agent-backend \
  -e MONGO_URI="mongodb://host.docker.internal:27017/agentdb" \
  -e PORT=3001 -e HOST=0.0.0.0 -e JWT_SECRET=supersecret \
  -p 3001:3001 agent-backend
```

Notes:
- The Dockerfile exposes port 3000 by default; the server will listen on whichever `PORT` you pass in. Make sure the `-p` mapping matches the `PORT` you set.
- For Docker to reach a MongoDB instance running on your host (Windows), `host.docker.internal` is commonly used in place of `localhost`.

## Environment variables (summary)

- Backend (`backend/src/env/.env`):
  - `PORT` — port the backend listens on (e.g., 3001)
  - `HOST` — host/IP to bind to (e.g., `127.0.0.1` or `0.0.0.0`)
  - `MONGO_URI` — MongoDB connection string
  - `JWT_SECRET` — secret used to sign/verify JWT tokens (required for auth middleware)

- Frontend (`frontend/.env.local`):
  - `NEXT_PUBLIC_API_BASE` — base URL of the backend API (e.g., `http://localhost:3001`)

## API overview (important endpoints)

- POST /api/login — authenticate. Returns `{ success, message, user, token }` on success.
- POST /api/register — register a user.
- POST /api/create-agent — create an agent (protected)
- GET /api/get-agents — list agents (protected)
- POST /api/add-tasks — upload tasks file (multipart/form-data) (protected)
- GET /api/get-tasks — retrieve tasks (protected)
- GET /api/protected — test protected route (requires Authorization: Bearer <token>)

The frontend expects the above contract (see `frontend/README.md` for more details).

## Generating and using mock CSV data

- The repository includes `backend/src/utils/mockCSVGenerator.js` which writes `src/mockdata/mock_tasks.csv` by default.
- Run `npm run generate` in the `backend/` folder to regenerate the sample CSV (uses `@faker-js/faker`).
