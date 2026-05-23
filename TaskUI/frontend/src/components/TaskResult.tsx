import type { Task, TaskStatus } from "../types";

interface TaskResultProps {
  task: Task | null;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

export function TaskResult({ task }: TaskResultProps) {
  if (!task) {
    return (
      <section className="panel result-panel">
        <h2 className="panel-title">Result</h2>
        <p className="empty-message">Select a task from history or submit a new one.</p>
      </section>
    );
  }

  return (
    <section className="panel result-panel">
      <div className="result-header">
        <h2 className="panel-title">Result</h2>
        <span className={`status-badge status-${task.status}`}>
          {STATUS_LABEL[task.status]}
        </span>
      </div>
      <p className="result-prompt">
        <strong>Task:</strong> {task.prompt}
      </p>
      {task.status === "pending" || task.status === "running" ? (
        <p className="result-loading">Agent is working on this task...</p>
      ) : null}
      {task.result ? (
        <div className="result-output">
          <h3>Output</h3>
          <pre>{task.result}</pre>
        </div>
      ) : null}
      {task.error ? (
        <div className="result-error">
          <h3>Error</h3>
          <pre>{task.error}</pre>
        </div>
      ) : null}
    </section>
  );
}
