from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import require_roles, router as auth_router
from app.config import settings
from app.models import Role, User

app = FastAPI(title="ETDOX Lead Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}


# Sample protected routes proving server-side role checks; replaced by real features later.
@app.get("/admin/ping")
def admin_ping(user: User = Depends(require_roles(Role.admin))):
    return {"ok": True, "role": user.role}


@app.get("/leads/ping")
def leads_ping(user: User = Depends(require_roles(Role.admin, Role.sales, Role.viewer))):
    return {"ok": True, "role": user.role}
