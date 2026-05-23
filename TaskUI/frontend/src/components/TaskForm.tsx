import type { FormEvent } from "react";

interface TaskFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function TaskForm({ value, onChange, onSubmit, disabled }: TaskFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input"
        placeholder="Enter a task for the agent..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" className="submit-btn" disabled={disabled || !value.trim()}>
        Submit
      </button>
    </form>
  );
}
