export type TaskStatus = "pending" | "running" | "completed" | "failed";

export type StepType = "status" | "llm" | "tool" | "agent_action" | "error";

export interface TaskStep {
  id: string;
  sequence: number;
  type: StepType;
  title: string;
  detail?: string;
  createdAt: string;
}

export interface TaskSummary {
  id: string;
  prompt: string;
  status: TaskStatus;
  result?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task extends TaskSummary {
  steps: TaskStep[];
}
