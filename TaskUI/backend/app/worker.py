import asyncio

from app import crud
from app.database import SessionLocal


async def simulate_task(task_id: str, prompt: str) -> None:
    should_fail = "fail" in prompt.lower()

    await _sleep_step(task_id, 0.4, lambda db: crud.update_task_status(db, task_id, "running"))
    await _append(task_id, 2, "status", "Processing started")

    await _append(
        task_id,
        3,
        "llm",
        "Planning",
        "Analyzing prompt and choosing approach",
        delay=0.5,
    )

    await _append(
        task_id,
        4,
        "agent_action",
        "Agent action",
        "Thought: I should use a helper tool to answer this.",
        delay=0.5,
    )

    await _append(
        task_id,
        5,
        "tool",
        "Running tool: word_count",
        f'Input: "{prompt}"',
        delay=0.5,
    )

    if should_fail:
        await _append(
            task_id,
            6,
            "error",
            "Execution failed",
            "Simulated agent error",
            delay=0.5,
        )

        def _fail(db):
            crud.fail_task(db, task_id, 'Simulated failure (prompt contained "fail")')

        await _run_db(_fail)
        return

    await _append(
        task_id,
        6,
        "llm",
        "Generating response",
        "Drafting final answer",
        delay=0.5,
    )

    await _append(task_id, 7, "status", "Completed", delay=0.5)

    def _complete(db):
        crud.complete_task(db, task_id, f"Processed: {prompt}")

    await _run_db(_complete)


async def _sleep_step(task_id: str, seconds: float, fn) -> None:
    await asyncio.sleep(seconds)
    await _run_db(fn)


async def _append(
    task_id: str,
    sequence: int,
    step_type: str,
    title: str,
    detail: str | None = None,
    delay: float = 0,
) -> None:
    if delay:
        await asyncio.sleep(delay)

    def _add(db):
        crud.add_step(db, task_id, sequence, step_type, title, detail)
        db.commit()

    await _run_db(_add)


async def _run_db(fn) -> None:
    db = SessionLocal()
    try:
        fn(db)
    finally:
        db.close()
