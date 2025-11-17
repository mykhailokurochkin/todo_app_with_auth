# Backend API

Minimal Express + Sequelize server with JWT auth.

## Run

1. `cd backend`
2. `npm install`
3. `npm run build`
4. `npm run dev` (or `npm start` after build)

That’s it. SQLite is created automatically (or use `DATABASE_URL` for another DB). HTTP endpoints live under `/auth`, `/auth/refresh`, `/auth/logout`.
