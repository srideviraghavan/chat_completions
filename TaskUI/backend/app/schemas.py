from datetime import datetime

from pydantic import BaseModel, Field

from app.models import TaskRecord, TaskStepRecord


class TaskCreate(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)


class TaskStepResponse(BaseModel):
    id: str
    sequence: int
    type: str
    title: str
    detail: str | None = None
    createdAt: str


class TaskResponse(BaseModel):
    id: str
    prompt: str
    status: str
    result: str | None = None
    error: str | None = None
    steps: list[TaskStepResponse]
    createdAt: str
    updatedAt: str


class TaskListItem(BaseModel):
    id: str
    prompt: str
    status: str
    result: str | None = None
    error: str | None = None
    createdAt: str
    updatedAt: str


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def step_to_response(step: TaskStepRecord) -> TaskStepResponse:
    return TaskStepResponse(
        id=str(step.id),
        sequence=step.sequence,
        type=step.type,
        title=step.title,
        detail=step.detail,
        createdAt=_iso(step.created_at),
    )


def task_to_response(task: TaskRecord) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        prompt=task.prompt,
        status=task.status,
        result=task.result,
        error=task.error,
        steps=[step_to_response(s) for s in task.steps],
        createdAt=_iso(task.created_at),
        updatedAt=_iso(task.updated_at),
    )


def task_to_list_item(task: TaskRecord) -> TaskListItem:
    return TaskListItem(
        id=task.id,
        prompt=task.prompt,
        status=task.status,
        result=task.result,
        error=task.error,
        createdAt=_iso(task.created_at),
        updatedAt=_iso(task.updated_at),
    )
