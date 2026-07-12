"""Create or update a portal user (admin / team / client).

Usage:
    python -m scripts.create_admin --email you@example.com --name "Your Name"
    python -m scripts.create_admin --email dev@zenova.agency --name "Mira" --role team
    python -m scripts.create_admin --email client@northwind.co --name "Maya" --role client

You will be prompted for a password (hidden). Pass ``--password`` to skip the
prompt (not recommended outside automation). ``--role`` defaults to ``admin``
so existing automation that doesn't pass it keeps working.
"""

from __future__ import annotations

import argparse
import asyncio
import getpass
import sys

from sqlalchemy import select

from app.db import session_scope
from app.models import AdminUser
from app.security import hash_password

ALLOWED_ROLES = ("admin", "team", "client")


async def upsert_user(email: str, name: str, password: str, role: str) -> None:
    email = email.lower().strip()
    async with session_scope() as db:
        existing = (await db.execute(select(AdminUser).where(AdminUser.email == email))).scalar_one_or_none()
        if existing is None:
            db.add(
                AdminUser(
                    email=email,
                    name=name,
                    password_hash=hash_password(password),
                    role=role,
                )
            )
            print(f"Created {role} {email}.")
        else:
            existing.name = name
            existing.password_hash = hash_password(password)
            existing.role = role
            existing.is_active = True
            print(f"Updated {role} {email}.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update a portal user.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument(
        "--role",
        default="admin",
        choices=ALLOWED_ROLES,
        help="Which portal the user can sign in to. Defaults to admin.",
    )
    parser.add_argument("--password", default=None, help="If omitted, prompted interactively.")
    args = parser.parse_args()

    password = args.password
    if not password:
        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm:  ")
        if password != confirm:
            print("Passwords do not match.", file=sys.stderr)
            sys.exit(1)
    if len(password) < 8:
        print("Password must be at least 8 characters.", file=sys.stderr)
        sys.exit(1)

    asyncio.run(upsert_user(args.email, args.name, password, args.role))


if __name__ == "__main__":
    main()
