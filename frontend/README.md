# Agent Management System — Frontend

This repository contains the frontend for the Agent Management System — a Next.js (App Router) application that provides admin and agent workflows.

Features
- Single login (backend decides admin vs agent)
- Admin dashboard: create agents, upload & distribute task lists
- Agent view: profile and assigned tasks
- Global toasts and full-page loading overlay

Requirements
- Node.js 18 LTS or newer
- npm (bundled with Node)

Install
```cmd
cd C:\Users\ASUS\codes\agent-management-system\frontend
npm install
```

Environment
Create a `.env.local` in the project root with the backend base URL. Example:
```
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Development
```cmd
npm run dev
```
Open http://localhost:3000

Production
```cmd
npm run build
npm run start
```

Scripts
- `dev` — start dev server
- `build` — production build
- `start` — start built app
- `lint` — run Biome linter
- `format` — format with Biome

Project layout (key files)
- `src/app/` — Next.js pages (app router)
- `src/components/` — UI components (NavBar, UIProvider, Spinner, UploadDistributor, AgentProfile, AgentTasks, etc.)
- `src/lib/api.ts` — central API helper
- `src/lib/uiService.ts` — small UI bridge (notify, show/hide loading)
- `src/components/UIProvider.tsx` — registers UI handlers and renders toasts/loading

Backend contract
This frontend expects a backend that implements these endpoints:
- `POST /api/login` -> { success, message, user, token }
- `POST /api/create-agent` -> { success, agent }
- `POST /api/add-tasks` (multipart with `file`) -> { success, message, tasks }
- `GET /api/get-tasks` -> { tasks: [...] } or { tasks: { agentId: { tasks: [...] }, ... } }
- `GET /api/get-agents` -> { success: true, agents: [...] }
- `GET /api/protected` -> { success: true, user } or 401
