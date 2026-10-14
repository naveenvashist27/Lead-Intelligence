# ETDOX Lead Intelligence Engine
Internal business-prospecting tool. See `docs/ETDOX_Lead_Intelligence_Engine_PRD.docx`.

## Run locally
1. `copy .env.example .env` and set a long random `SECRET_KEY`.
2. Database: `docker compose up -d db`
3. Backend (from `backend/`):
   - `python -m venv .venv` then `.venv\Scripts\activate`, `pip install -r requirements.txt`
   - `alembic upgrade head`
   - `python -m scripts.create_user you@etdox.com admin "Your Name"` (prompts for password)
   - `uvicorn app.main:app --reload` (http://localhost:8000/docs)
   - `pytest`
4. Frontend (from `frontend/`): `copy .env.local.example .env.local`, `npm install`, `npm run dev` (http://localhost:3000)

## Roles
`admin`, `sales`, `viewer`. Enforced on the server via `require_roles(...)` in `backend/app/auth.py`.

## Status
Phase 1 (foundations) done: login, roles, audit log, migrations. Next: Phase 2 (search + provider) after provider terms are verified.
