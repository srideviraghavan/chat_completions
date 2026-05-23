import asyncio
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db, init_db
from app.schemas import TaskCreate, TaskListItem, TaskResponse, task_to_list_item, task_to_response
from app.seed import seed_if_empty
from app.worker import simulate_task

POLL_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_if_empty()
    yield


app = FastAPI(title="Task UI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=POLL_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/tasks", response_model=list[TaskListItem])
def list_tasks(db: Session = Depends(get_db)) -> list[TaskListItem]:
    tasks = crud.list_tasks(db)
    return [task_to_list_item(t) for t in tasks]


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)) -> TaskResponse:
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_to_response(task)


@app.post("/api/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    body: TaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> TaskResponse:
    prompt = body.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    task = crud.create_task(db, prompt)
    background_tasks.add_task(_run_simulation, task.id, prompt)
    return task_to_response(task)


async def _run_simulation(task_id: str, prompt: str) -> None:
    await simulate_task(task_id, prompt)
