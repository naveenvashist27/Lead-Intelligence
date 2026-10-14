from sqlalchemy.orm import Session

from app.models import AuditEvent


def record(
    db: Session,
    action: str,
    actor_id: int | None = None,
    entity_type: str | None = None,
    entity_id: str | int | None = None,
    outcome: str = "success",
    meta: dict | None = None,
) -> None:
    """Write an audit event. Never put emails, phone numbers or passwords in meta."""
    db.add(
        AuditEvent(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=None if entity_id is None else str(entity_id),
            outcome=outcome,
            meta=meta,
        )
    )
    db.commit()
