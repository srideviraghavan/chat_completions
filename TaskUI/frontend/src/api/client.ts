import type { Task, TaskSummary } from "../types";

const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listTasks(): Promise<TaskSummary[]> {
  return request<TaskSummary[]>("/tasks");
}

export async function getTask(id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}`);
}

export async function createTask(prompt: string): Promise<Task> {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/health");
}
