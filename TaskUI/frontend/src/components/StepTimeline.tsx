import { useState } from "react";
import type { TaskStep } from "../types";

interface StepTimelineProps {
  steps: TaskStep[];
}

const TYPE_LABEL: Record<TaskStep["type"], string> = {
  status: "Status",
  llm: "LLM",
  tool: "Tool",
  agent_action: "Action",
  error: "Error",
};

export function StepTimeline({ steps }: StepTimelineProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const sorted = [...steps].sort((a, b) => a.sequence - b.sequence);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="panel steps-panel">
      <h2 className="panel-title">Execution steps</h2>
      {sorted.length === 0 ? (
        <p className="empty-message">No steps recorded yet.</p>
      ) : (
        <ol className="step-timeline">
          {sorted.map((step) => (
            <li key={step.id} className={`step-item step-type-${step.type}`}>
              <div className="step-header">
                <span className={`step-type-badge type-${step.type}`}>
                  {TYPE_LABEL[step.type]}
                </span>
                <span className="step-title">{step.title}</span>
                {step.detail ? (
                  <button
                    type="button"
                    className="step-toggle"
                    onClick={() => toggle(step.id)}
                  >
                    {expanded.has(step.id) ? "Hide" : "Details"}
                  </button>
                ) : null}
              </div>
              {step.detail && expanded.has(step.id) ? (
                <pre className="step-detail">{step.detail}</pre>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
