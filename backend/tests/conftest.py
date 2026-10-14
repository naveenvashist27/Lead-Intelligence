import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.models import AuditEvent, User
from app.security import hash_password

PASSWORD = "correct-horse-1"


@pytest.fixture()
def db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, expire_on_commit=False)()
    for role in ("admin", "sales", "viewer"):
        session.add(User(email=f"{role}@example.com", role=role, password_hash=hash_password(PASSWORD)))
    session.add(User(email="off@example.com", role="admin", is_active=False, password_hash=hash_password(PASSWORD)))
    session.commit()
    yield session
    session.close()


@pytest.fixture()
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


def login(client, role):
    r = client.post("/auth/login", json={"email": f"{role}@example.com", "password": PASSWORD})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
