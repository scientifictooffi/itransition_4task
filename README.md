# Task 4

Full-stack user management app (React + Express + SQLite).

## Run locally

Server (PostgreSQL required):
- `cd task4/server`
- `cp .env.example .env`
- `npm install`
- `npm run dev`

Client:
- `cd task4/client`
- `npm install`
- `npm run dev`

The client runs on `http://localhost:5173` and the server on `http://localhost:4000`.

## Notes
- Unique email index is created in `server/db.js`.
- `getUniqIdValue()` lives in `server/utils/uniqId.js`.
- Database uses PostgreSQL via `DATABASE_URL`.

## Deployment (summary)
- Deploy server and expose `PUBLIC_API_URL`, `SESSION_SECRET`, and SMTP vars.
- Deploy client and set `VITE_API_URL` to the server URL.
- Update `CLIENT_ORIGIN` on the server to the client URL.
# itransition_4task
# itransition_4task
# itransition_4task
