# Developer Workflow & DB Guidance

## Environment Setup
- Copy `.env.development.example` to `.env`.
- **Local Database (Postgres)**: 
  - Install PostgreSQL locally via package manager or run via Docker (`docker run -p 5432:5432 postgres`).
  - Or use a remote managed dev instance for Termux simplicity.
- **Local Redis**: 
  - Install Redis via package manager or run via Docker (`docker run -p 6379:6379 redis`).

## Running Services Locally
Open separate terminal sessions (or use tmux) for running the stack locally:
1. **Backend**: `cd backend && npm install && npm run dev`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **Workers**: `cd worker && python3 main.py` or npm equivalent based on implementation.

## End-to-end Verification
Validate the dev loop by starting the backend API (`cd backend && npm run dev`) and verifying it returns the "hello world" prompt payload.
