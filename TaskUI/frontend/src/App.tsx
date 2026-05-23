import { useCallback, useEffect, useState } from "react";
import * as api from "./api/client";
import { TaskForm } from "./components/TaskForm";
import { TaskHistory } from "./components/TaskHistory";
import { TaskResult } from "./components/TaskResult";
import { StepTimeline } from "./components/StepTimeline";
import type { Task, TaskSummary } from "./types";
import "./App.css";

function toSummary(task: Task): TaskSummary {
  const { steps: _steps, ...summary } = task;
  return summary;
}

function App() {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [input, setInput] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    const list = await api.listTasks();
    setTasks(list);
    return list;
  }, []);

  useEffect(() => {
    loadTasks()
      .then((list) => {
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => undefined);
  }, [loadTasks]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedTask(null);
      return;
    }

    let cancelled = false;

    api
      .getTask(selectedId)
      .then((task) => {
        if (!cancelled) setSelectedTask(task);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (
      !selectedTask ||
      (selectedTask.status !== "pending" && selectedTask.status !== "running")
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const task = await api.getTask(selectedTask.id);
        setSelectedTask(task);
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? toSummary(task) : t)),
        );
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Poll failed");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedTask?.id, selectedTask?.status]);

  const isBusy =
    submitting ||
    selectedTask?.status === "pending" ||
    selectedTask?.status === "running";

  const handleSubmit = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isBusy) return;

    setSubmitting(true);
    setLoadError(null);

    try {
      const task = await api.createTask(prompt);
      setTasks((prev) => [toSummary(task), ...prev]);
      setSelectedId(task.id);
      setSelectedTask(task);
      setInput("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }, [input, isBusy]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Agent Tasks</h1>
        <p className="app-subtitle">
          Phase 2 — tasks persisted via FastAPI + SQLite. Include &quot;fail&quot; in a prompt to simulate an error.
        </p>
      </header>

      {loadError ? <p className="app-error">{loadError}</p> : null}

      <TaskForm
        value={input}
        onChange={setInput}
        onSubmit={() => void handleSubmit()}
        disabled={isBusy}
      />

      <main className="app-main">
        <TaskHistory
          tasks={tasks}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="detail-column">
          <TaskResult task={selectedTask} />
          <StepTimeline steps={selectedTask?.steps ?? []} />
        </div>
      </main>
    </div>
  );
}

export default App;
