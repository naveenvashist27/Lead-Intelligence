"""Create a user. Usage (from backend/):
    python -m scripts.create_user EMAIL ROLE [NAME]
The password is read from the prompt so it never lands in shell history.
"""
import getpass
import sys

from sqlalchemy import select

from app.db import SessionLocal
from app.models import Role, User
from app.security import hash_password


def main() -> None:
    if len(sys.argv) < 3 or sys.argv[2] not in {r.value for r in Role}:
        sys.exit("usage: python -m scripts.create_user EMAIL {sales|admin|viewer} [NAME]")
    email = sys.argv[1].strip().lower()
    name = sys.argv[3] if len(sys.argv) > 3 else ""
    password = getpass.getpass("Password (min 10 chars): ")
    if len(password) < 10:
        sys.exit("Password too short")
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.email == email)):
            sys.exit("User already exists")
        db.add(User(email=email, name=name, role=sys.argv[2], password_hash=hash_password(password)))
        db.commit()
    print(f"Created {sys.argv[2]} user {email}")


if __name__ == "__main__":
    main()
