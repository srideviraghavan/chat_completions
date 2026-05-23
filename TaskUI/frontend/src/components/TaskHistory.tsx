import type { TaskSummary } from "../types";

interface TaskHistoryProps {
  tasks: TaskSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_LABEL: Record<TaskSummary["status"], string> = {
  pending: "Pending",
  running: "Running",
  completed: "Done",
  failed: "Failed",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max = 48): string {
  return text.length <= max ? text : `${text.slice(0, max)}...`;
}

export function TaskHistory({ tasks, selectedId, onSelect }: TaskHistoryProps) {
  const sorted = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section className="panel history-panel">
      <h2 className="panel-title">History</h2>
      {sorted.length === 0 ? (
        <p className="empty-message">No tasks yet.</p>
      ) : (
        <ul className="history-list">
          {sorted.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                className={`history-item${selectedId === task.id ? " selected" : ""}`}
                onClick={() => onSelect(task.id)}
              >
                <span className={`status-badge status-${task.status}`}>
                  {STATUS_LABEL[task.status]}
                </span>
                <span className="history-prompt">{truncate(task.prompt)}</span>
                <span className="history-time">{formatTime(task.createdAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

