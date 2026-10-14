from fastapi import FastAPI

app = FastAPI(title="ETDOX Lead Intelligence Engine")


@app.get("/health")
def health():
    return {"status": "ok"}
