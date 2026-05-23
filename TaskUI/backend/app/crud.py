from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import TaskRecord, TaskStepRecord, utcnow


def list_tasks(db: Session, limit: int = 50) -> list[TaskRecord]:
    stmt = (
        select(TaskRecord)
        .order_by(TaskRecord.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_task(db: Session, task_id: str) -> TaskRecord | None:
    stmt = (
        select(TaskRecord)
        .where(TaskRecord.id == task_id)
        .options(selectinload(TaskRecord.steps))
    )
    return db.scalars(stmt).first()


def create_task(db: Session, prompt: str) -> TaskRecord:
    task = TaskRecord(prompt=prompt.strip(), status="pending")
    db.add(task)
    db.flush()
    add_step(db, task.id, 1, "status", "Task received")
    db.commit()
    db.refresh(task)
    return get_task(db, task.id)  # type: ignore[return-value]


def add_step(
    db: Session,
    task_id: str,
    sequence: int,
    step_type: str,
    title: str,
    detail: str | None = None,
) -> TaskStepRecord:
    step = TaskStepRecord(
        task_id=task_id,
        sequence=sequence,
        type=step_type,
        title=title,
        detail=detail,
    )
    db.add(step)
    return step


def update_task_status(db: Session, task_id: str, status: str) -> None:
    task = db.get(TaskRecord, task_id)
    if task is None:
        return
    task.status = status
    task.updated_at = utcnow()
    db.commit()


def complete_task(db: Session, task_id: str, result: str) -> None:
    task = db.get(TaskRecord, task_id)
    if task is None:
        return
    task.status = "completed"
    task.result = result
    task.updated_at = utcnow()
    db.commit()


def fail_task(db: Session, task_id: str, error: str) -> None:
    task = db.get(TaskRecord, task_id)
    if task is None:
        return
    task.status = "failed"
    task.error = error
    task.updated_at = utcnow()
    db.commit()


def count_tasks(db: Session) -> int:
    return len(list(db.scalars(select(TaskRecord.id)).all()))
