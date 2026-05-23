# Task UI

## Phase 2: FastAPI + SQLite + REST API

### Backend

```bash
cd TaskUI/backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd TaskUI/frontend
npm install
npm run dev
```

Open http://localhost:5173 (proxies `/api` to the backend).

### API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List tasks (summary) |
| GET | `/api/tasks/{id}` | Task with execution steps |
| POST | `/api/tasks` | Create task (`{"prompt":"..."}`) |

Task processing is simulated server-side until Phase 3 (LangChain agent). Include `fail` in a prompt to simulate an error.

### Phase 3 (next)

- LangChain agent with real execution steps via LM Studio
