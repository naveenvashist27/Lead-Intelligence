from sqlalchemy import select

from app.models import AuditEvent
from tests.conftest import PASSWORD, login


def test_login_success_and_me(client):
    h = login(client, "sales")
    assert client.get("/auth/me", headers=h).json()["role"] == "sales"


def test_login_wrong_password_and_unknown_user_same_message(client):
    a = client.post("/auth/login", json={"email": "sales@example.com", "password": "nope"})
    b = client.post("/auth/login", json={"email": "ghost@example.com", "password": PASSWORD})
    assert a.status_code == b.status_code == 401
    assert a.json() == b.json()


def test_inactive_user_cannot_login(client):
    r = client.post("/auth/login", json={"email": "off@example.com", "password": PASSWORD})
    assert r.status_code == 401


def test_no_token_and_bad_token_rejected(client):
    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_admin_only_route(client):
    assert client.get("/admin/ping").status_code == 401
    assert client.get("/admin/ping", headers=login(client, "sales")).status_code == 403
    assert client.get("/admin/ping", headers=login(client, "viewer")).status_code == 403
    assert client.get("/admin/ping", headers=login(client, "admin")).status_code == 200


def test_all_roles_can_read_leads_ping(client):
    for role in ("admin", "sales", "viewer"):
        assert client.get("/leads/ping", headers=login(client, role)).status_code == 200


def test_login_audited_without_email(client, db):
    client.post("/auth/login", json={"email": "sales@example.com", "password": "bad"})
    login(client, "sales")
    events = db.scalars(select(AuditEvent).where(AuditEvent.action == "login")).all()
    assert {e.outcome for e in events} == {"failure", "success"}
    assert all("example.com" not in str(e.meta) for e in events)
