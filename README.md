# ETDOX Lead Intelligence Engine
Internal business-prospecting tool. See `docs/ETDOX_Lead_Intelligence_Engine_PRD.docx`.

## Run locally
    docker compose up -d db
    cd backend && python -m venv .venv && .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    pytest
