from sqlalchemy.orm import Session

from app import crud
from app.database import SessionLocal, init_db
from app.models import TaskRecord


SEED_TASKS = [
    {
        "prompt": "Summarize the benefits of unit testing",
        "status": "completed",
        "result": (
            "Unit tests catch regressions early, document expected behavior, "
            "and make refactoring safer."
        ),
        "steps": [
            (1, "status", "Task received", None),
            (2, "llm", "Planning", "Analyzing prompt and choosing approach"),
            (3, "tool", "Running tool: search", 'Query: "unit testing benefits"'),
            (4, "llm", "Generating response", "Drafting final answer"),
            (5, "status", "Completed", None),
        ],
    },
    {
        "prompt": "List three colors",
        "status": "completed",
        "result": "Red, green, and blue.",
        "steps": [
            (1, "status", "Task received", None),
            (2, "llm", "Generating response", None),
            (3, "status", "Completed", None),
        ],
    },
]


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        if crud.count_tasks(db) > 0:
            return
        for item in SEED_TASKS:
            task = TaskRecord(
                prompt=item["prompt"],
                status=item["status"],
                result=item["result"],
            )
            db.add(task)
            db.flush()
            for sequence, step_type, title, detail in item["steps"]:
                crud.add_step(db, task.id, sequence, step_type, title, detail)
        db.commit()
    finally:
        db.close()
