# Agent Management System — Backend API

This document describes the HTTP API provided by the backend service in this repository.

## Overview

Base URL when running locally: http://<HOST>:<PORT>

- Default start: `npm start` (runs `node src/index.js`).
- Environment variables are loaded from `src/env/.env` via `dotenv`.

Required environment variables (examples):

```
PORT=3000
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/agent-management
JWT_SECRET=your_jwt_secret_here
```

## Authentication

- The API uses JSON Web Tokens (JWT). After successful login or registration, the server returns a token.
- Protected routes require the Authorization header:

```
Authorization: Bearer <token>
```

The middleware decodes the token and sets `req.user` to the token payload. The payload contains at least `{ userId | agentId, email, role }` where role is `admin` or `agent`.

## Models (shape)

- User (admin)
  - email: string (required, unique)
  - password: string (hashed)

- Agent
  - name: string (required)
  - email: string (required, unique)
  - mobile: string (required, E.164 style, e.g. +1234567890)
  - password: string (hashed)

- Task
  - agent: ObjectId (ref Agent)
  - firstName: string
  - phone: string
  - notes: string
  - createdAt: date

## Endpoints

All endpoints in this document are relative to the server root. Example: `POST http://localhost:3000/api/login`.

### 1) POST /api/register

Register a new admin user.

Request
- Content-Type: application/json
- Body:

```json
{
  "email": "admin@example.com",
  "password": "securePassword"
}
```

Responses
- 201 Created

```json
{
  "success": true,
  "message": "Admin registered successfully",
  "user": { "email": "admin@example.com", "role": "admin" },
  "token": "<jwt>"
}
```

- 400 Bad Request — validation errors

```json
{
  "success": false,
  "errors": { "email": "Email already registered" }
}
```

- 500 Server Error

### 2) POST /api/login

Login for admin or agent.

Request
- Content-Type: application/json
- Body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Responses
- 200 OK

```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": "<id>", "email": "user@example.com", "name": "Name or Admin", "role": "admin|agent" },
  "token": "<jwt>"
}
```

- 401 Unauthorized — invalid credentials

### 3) POST /api/create-agent  (Protected, admin only)

Create a new agent. Requires Authorization header with an admin token.

Request
- Content-Type: application/json
- Body:

```json
{
  "name": "Agent Name",
  "email": "agent@example.com",
  "mobile": "+1234567890",
  "password": "agentPassword"
}
```

Notes
- `mobile` must match E.164-like format: `+<countrycode><number>`.
- Password must be at least 6 characters.

Responses
- 201 Created

```json
{
  "success": true,
  "message": "Agent added successfully",
  "agent": { "name": "Agent Name", "email": "agent@example.com", "mobile": "+1234567890" },
  "token": "<jwt for agent>"
}
```

- 400 Bad Request — validation or duplicate email
- 403 Forbidden — when token missing or not admin

### 4) POST /api/add-tasks  (Protected, admin only)

Upload a CSV/XLS/XLSX of tasks. The route expects a multipart/form-data request with a file field named `file`.

Accepted mime types: `text/csv`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

CSV/XLSX layout (headers are case-sensitive):
- FirstName
- Phone
- Notes

Behavior
- The server reads the first sheet and converts rows to tasks.
- It validates that each row has the required columns.
- Tasks are distributed round-robin across all existing agents.
- If there are fewer than 1 agent, the endpoint returns an error saying at least 5 agents are required (note: code message says minimum 5 but checks for length < 1 — see Notes).

Request (curl example)

```
curl -X POST "http://localhost:3000/api/add-tasks" \
  -H "Authorization: Bearer <admin-token>" \
  -F "file=@/path/to/tasks.csv"
```

Responses
- 201 Created

```json
{
  "success": true,
  "message": "Tasks uploaded and distributed successfully",
  "tasks": {
    "agent1@example.com": [{ "firstName": "John", "phone": "...", "notes": "..." }],
    "agent2@example.com": [ ... ]
  }
}
```

- 400 Bad Request — missing file, invalid file, CSV missing columns, or not enough agents
- 403 Forbidden — not admin

### 5) GET /api/get-tasks  (Protected, admin or agent)

Get tasks for the current user.

Behavior
- If the token belongs to an agent (role: `agent`) the route returns tasks assigned to that agent (uses `req.user.userId` as agent id).
- If the token belongs to an admin (role: `admin`) the route collects all agents and returns a mapping of agent emails to their tasks.

Responses

- 200 OK for agent

```json
{
  "success": true,
  "tasks": [
    { "_id": "<id>", "agent": "<agentId>", "firstName": "John", "phone": "...", "notes": "...", "createdAt": "..." }
  ]
}
```

- 200 OK for admin

```json
{
  "success": true,
  "tasks": {
    "agent1@example.com": { "name": "Agent One", "tasks": [ ... ] },
    "agent2@example.com": { "name": "Agent Two", "tasks": [ ... ] }
  }
}
```

- 401 Unauthorized — when token missing/invalid
- 403 Forbidden — when user role unrecognized

## Error formats

The API attempts to be consistent and returns JSON objects containing at least a `success: boolean` field and either `message` or `errors`.

Common status codes used:

- 200 OK — success
- 201 Created — resource created
- 400 Bad Request — validation or client error
- 401 Unauthorized — missing/invalid token or login failure
- 403 Forbidden — authenticated but not allowed
- 500 Server Error — unexpected errors

## Notes and Implementation Details

- Auth middleware expects Authorization header in the format `Bearer <token>`.
- Registration creates admin users only. Agents are created via `/api/create-agent` by an admin.
- The CSV importer uses the first sheet and expects headers `FirstName`, `Phone`, `Notes` exactly as spelled.
- The `addTaskRoute` includes a message that there must be minimum 5 agents, but the code currently only checks `agents.length < 1`. Review this if you intend to require 5 agents.
- Passwords are hashed with bcrypt.

## How to run locally

1. Install dependencies

```
npm install
```

2. Create `src/env/.env` with the environment variables (see above).

3. Start MongoDB and then start the server

```
npm start
```

4. Optional: Generate mock CSV data with the included generator

```
npm run generate
```

## Examples

- Create admin (register): see POST /api/register above.
- Login: POST /api/login returns token.
- Create agent: POST /api/create-agent with admin token.
- Upload tasks: POST /api/add-tasks with admin token and multipart file `file`.
- Get tasks: GET /api/get-tasks with agent or admin token.

### Quick curl examples

- Register admin

```
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"admin@example.com\", \"password\": \"secret123\" }"
```

- Login

```
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"admin@example.com\", \"password\": \"secret123\" }"
```

- Create agent (admin token required)

```
curl -X POST http://localhost:3000/api/create-agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d "{ \"name\": \"Agent One\", \"email\": \"agent1@example.com\", \"mobile\": \"+1234567890\", \"password\": \"agentpass\" }"
```

- Upload tasks (CSV)

```
curl -X POST http://localhost:3000/api/add-tasks \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "file=@/path/to/tasks.csv"
```

- Get tasks (agent or admin)

```
curl -X GET http://localhost:3000/api/get-tasks \
  -H "Authorization: Bearer <TOKEN>"
```

## Deploy to Render (using Docker)

This repository includes a `Dockerfile` suitable for deploying to Render as a web service that uses a Docker image.

Basic steps on Render:

1. Create a new Web Service and select "Deploy from Dockerfile" (or connect your Git repo and choose Docker).
2. Set the build and runtime environment variables in the Render dashboard (these override any local `.env`). Important variables:

```
PORT (optional) - Render provides $PORT automatically; the app reads process.env.PORT
MONGO_URI - MongoDB connection string (point to a hosted MongoDB or Atlas cluster)
JWT_SECRET - secret for JWT signing
HOST - set to 0.0.0.0 or leave empty; index.js reads this variable
```

3. Render will build the Docker image using the included `Dockerfile` which runs `npm ci` and then `npm start`.

Notes & recommendations:
- The Dockerfile uses `node:18-alpine` and installs only production dependencies via `npm ci --only=production`.
- Ensure your MongoDB is reachable from Render (set `MONGO_URI` to a valid connection string). If using MongoDB Atlas, whitelist Render's outbound IPs or use VPC peering.
- Render injects a `PORT` environment variable. `src/index.js` expects `process.env.PORT` and `process.env.HOST`; set `HOST` to `0.0.0.0` if needed.
- For security, set `JWT_SECRET` securely in Render's Dashboard.
- If you rely on uploading files to disk, prefer using an external object store (S3) since Render containers are ephemeral. This project uses in-memory upload handling (multer memoryStorage) so there is no persistent file dependency.
